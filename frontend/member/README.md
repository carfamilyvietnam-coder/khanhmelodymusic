# KhanhMelody public music page

The public music page does not require customer login. Configure the API and bank QR image in the frontend build environment:

```env
VITE_API_BASE_URL=https://api.khanhmelodymussic.com/api
VITE_PAYMENT_QR_IMAGE_URL=/payment-qr.png
```

Place the corresponding 50,000 VND QR image at `public/payment-qr.png` before building. The guest download form sends the customer's stated name, phone number, and transfer reference, then opens the download immediately. Admin can review the submitted claims and block further downloads for a phone number. The application does not verify bank transfers or distinguish false claims; those actions require a bank/payment webhook or manual review.
