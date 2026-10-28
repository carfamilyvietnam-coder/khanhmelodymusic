import unittest
from decimal import Decimal
from io import BytesIO
from unittest.mock import MagicMock, patch

from flask_jwt_extended import create_access_token

from app import create_app, db
from app.models.song import Song
from app.models.transaction import Transaction
from app.models.user import User
from app.models.wallet import Wallet
from app.routes.upload import normalize_audio_key


class AccessControlTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.context = self.app.app_context()
        self.context.push()
        db.create_all()
        self.client = self.app.test_client()
        self.member = self.make_user('member', 'member@example.test', 'member')
        self.admin = self.make_user('admin', 'admin@example.test', 'admin')
        self.member_token = self.token_for(self.member)
        self.admin_token = self.token_for(self.admin)

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.context.pop()

    def make_user(self, username, email, role):
        user = User(username=username, email=email, role=role, is_active=True)
        user.set_password('long-enough-password')
        db.session.add(user)
        db.session.flush()
        db.session.add(Wallet(user_id=user.id, balance=Decimal('100.00')))
        db.session.commit()
        return user

    def token_for(self, user):
        return create_access_token(identity=str(user.id))

    def headers(self, token):
        return {'Authorization': f'Bearer {token}'}

    def test_public_registration_cannot_create_admin_and_hides_password_hash(self):
        response = self.client.post('/api/register', json={
            'username': 'newmember',
            'email': 'newmember@example.test',
            'password': 'long-enough-password',
            'role': 'admin',
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['user']['role'], 'member')
        self.assertNotIn('password_hash', response.json['user'])
        self.assertIsNotNone(Wallet.query.filter_by(user_id=response.json['user']['id']).first())

    def test_member_cannot_read_admin_resources_or_other_wallet(self):
        self.assertEqual(self.client.get(
            '/api/admin/users', headers=self.headers(self.member_token)).status_code, 403)
        self.assertEqual(self.client.get(
            f'/api/admin/wallets/user/{self.admin.id}',
            headers=self.headers(self.member_token)).status_code, 403)

    def test_admin_can_read_admin_resources(self):
        response = self.client.get('/api/admin/users', headers=self.headers(self.admin_token))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 2)

    def test_admin_balance_edits_are_validated_and_ledgered_as_adjustments(self):
        response = self.client.put(
            f'/api/admin/users/{self.member.id}',
            json={'wallet_balance': 125.0},
            headers=self.headers(self.admin_token),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Wallet.query.filter_by(user_id=self.member.id).first().balance, Decimal('125.00'))
        adjustment = Transaction.query.filter_by(
            user_id=self.member.id,
            transaction_type='adjustment',
        ).one()
        self.assertEqual(adjustment.amount, Decimal('25.00'))
        self.assertEqual(self.client.get(
            '/api/admin/revenue', headers=self.headers(self.admin_token)
        ).json['total_revenue'], 0)

    def test_only_admin_can_delete_songs_and_purchase_history_is_preserved(self):
        song = Song(title='Track', artist='Artist', price=Decimal('25.00'), audio_url='audio/track.mp3')
        db.session.add(song)
        db.session.flush()
        purchase = Transaction(
            user_id=self.member.id,
            song_id=song.id,
            amount=Decimal('25.00'),
            transaction_type='purchase',
            status='completed',
        )
        db.session.add(purchase)
        db.session.commit()

        denied = self.client.delete(
            f'/api/admin/songs/{song.id}',
            headers=self.headers(self.member_token),
        )
        self.assertEqual(denied.status_code, 403)
        self.assertIsNotNone(db.session.get(Song, song.id))

        with patch('app.routes.upload.delete_object'):
            deleted = self.client.delete(
                f'/api/admin/songs/{song.id}',
                headers=self.headers(self.admin_token),
            )
        self.assertEqual(deleted.status_code, 200)
        preserved_purchase = db.session.get(Transaction, purchase.id)
        self.assertIsNotNone(preserved_purchase)
        self.assertIsNone(preserved_purchase.song_id)

    def test_r2_upload_requires_admin(self):
        upload = {'file': (BytesIO(b'audio'), 'track.mp3', 'audio/mpeg')}
        denied = self.client.post(
            '/api/upload/r2',
            data=upload,
            headers=self.headers(self.member_token),
            content_type='multipart/form-data',
        )
        self.assertEqual(denied.status_code, 403)

        with patch('app.routes.upload.get_r2_client') as get_client:
            get_client.return_value = MagicMock()
            admin_upload = {'file': (BytesIO(b'audio'), 'track.mp3', 'audio/mpeg')}
            response = self.client.post(
                '/api/upload/r2',
                data=admin_upload,
                headers=self.headers(self.admin_token),
                content_type='multipart/form-data',
            )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json['objectKey'].startswith('audio/'))

    def test_purchase_uses_server_price_and_is_idempotent(self):
        song = Song(title='Track', artist='Artist', price=Decimal('25.00'), audio_url='audio/track.mp3')
        db.session.add(song)
        db.session.commit()

        with patch('app.routes.songs.song_stream_url', return_value='https://storage.example/signed'):
            denied = self.client.get(
                f'/api/songs/{song.id}/stream',
                headers=self.headers(self.member_token),
            )
            first = self.client.post(
                f'/api/songs/{song.id}/download',
                headers=self.headers(self.member_token),
                json={'price': 0},
            )
            second = self.client.post(
                f'/api/songs/{song.id}/download',
                headers=self.headers(self.member_token),
                json={'price': 0},
            )

        wallet = Wallet.query.filter_by(user_id=self.member.id).first()
        self.assertEqual(denied.status_code, 403)
        self.assertEqual(first.status_code, 200)
        self.assertFalse(first.json['already_purchased'])
        self.assertEqual(second.status_code, 200)
        self.assertTrue(second.json['already_purchased'])
        self.assertEqual(wallet.balance, Decimal('75.00'))
        self.assertEqual(Transaction.query.filter_by(
            user_id=self.member.id, song_id=song.id, status='completed').count(), 1)

    def test_public_catalog_and_stream_do_not_require_login(self):
        song = Song(title='Public Track', artist='Artist', price=Decimal('50000.00'), audio_url='audio/track.mp3')
        db.session.add(song)
        db.session.commit()

        with patch('app.routes.songs.song_stream_url', return_value='https://storage.example/signed'):
            catalog = self.client.get('/api/public/songs')
            stream = self.client.get(f'/api/public/songs/{song.id}/stream')

        self.assertEqual(catalog.status_code, 200)
        self.assertEqual(catalog.json[0]['title'], 'Public Track')
        self.assertEqual(stream.status_code, 200)
        self.assertEqual(stream.json['stream_url'], 'https://storage.example/signed')
        self.assertEqual(song.play_count, 1)

    def test_guest_download_accepts_transfer_claim_but_does_not_mark_payment_verified(self):
        song = Song(title='Public Track', artist='Artist', price=Decimal('50000.00'), audio_url='audio/track.mp3')
        db.session.add(song)
        db.session.commit()

        invalid_amount = self.client.post(
            f'/api/public/songs/{song.id}/download',
            json={
                'customer_name': 'Customer',
                'phone': '0912345678',
                'transfer_reference': 'BANK123',
                'amount': 100,
            },
        )
        self.assertEqual(invalid_amount.status_code, 400)

        with patch('app.routes.songs.song_stream_url', return_value='https://storage.example/download'):
            response = self.client.post(
                f'/api/public/songs/{song.id}/download',
                json={
                    'customer_name': 'Customer',
                    'phone': '0912345678',
                    'transfer_reference': 'BANK123',
                    'amount': 50000,
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['stream_url'], 'https://storage.example/download')
        self.assertFalse(response.json['payment_verified'])
        self.assertEqual(song.download_count, 1)
        self.assertEqual(Transaction.query.filter_by(song_id=song.id).count(), 0)

    def test_admin_can_review_and_block_guest_by_phone(self):
        song = Song(title='Public Track', artist='Artist', price=Decimal('50000.00'), audio_url='audio/track.mp3')
        db.session.add(song)
        db.session.commit()
        phone = '0912345678'

        with patch('app.routes.songs.song_stream_url', return_value='https://storage.example/download'):
            submitted = self.client.post(
                f'/api/public/songs/{song.id}/download',
                json={
                    'customer_name': 'Customer',
                    'phone': phone,
                    'transfer_reference': 'BANK123',
                    'amount': 50000,
                },
            )
        self.assertEqual(submitted.status_code, 200)

        denied = self.client.get('/api/admin/guest-downloads', headers=self.headers(self.member_token))
        self.assertEqual(denied.status_code, 403)
        review = self.client.get('/api/admin/guest-downloads', headers=self.headers(self.admin_token))
        self.assertEqual(review.status_code, 200)
        self.assertEqual(review.json['claims'][0]['customer_phone'], '84912345678')
        self.assertEqual(review.json['customers'][0]['claims_count'], 1)

        locked = self.client.post(
            '/api/admin/guest-customers/84912345678/block',
            json={'reason': 'Admin review'},
            headers=self.headers(self.admin_token),
        )
        self.assertEqual(locked.status_code, 200)
        self.assertTrue(locked.json['customer']['is_blocked'])
        blocked_download = self.client.post(
            f'/api/public/songs/{song.id}/download',
            json={
                'customer_name': 'Customer',
                'phone': phone,
                'transfer_reference': 'BANK124',
                'amount': 50000,
            },
        )
        self.assertEqual(blocked_download.status_code, 403)

    def test_legacy_r2_url_is_reduced_to_a_valid_object_key(self):
        self.app.config['R2_PUBLIC_URL'] = 'https://khanhmelody.r2.dev'
        self.assertEqual(
            normalize_audio_key('https://khanhmelody.r2.dev/songs/old-track.mp3'),
            'songs/old-track.mp3',
        )
        with self.assertRaises(ValueError):
            normalize_audio_key('https://untrusted.example/audio/track.mp3')


if __name__ == '__main__':
    unittest.main()
