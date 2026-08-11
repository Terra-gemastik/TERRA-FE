# TERRA-FE Backend Connection Guide

## Current Configuration

**Backend URL**: `https://terra-be.vercel.app`

The frontend is now configured to connect to the deployed Vercel backend.

## Configuration File

The connection is configured in [`.env`](.env):

```bash
EXPO_PUBLIC_API_URL=https://terra-be.vercel.app
```

## Verifying the Connection

### 1. Check Backend Health

Test if the backend is accessible:

```bash
curl https://terra-be.vercel.app/health
```

Expected response:
```json
{
  "status": "sehat",
  "basis_data": true
}
```

### 2. Check API Info

```bash
curl https://terra-be.vercel.app/api/info
```

This should return information about installed modules and placeholder status.

### 3. Test Authentication

```bash
curl -H "X-Terra-Token: demo-petani-1" https://terra-be.vercel.app/onboarding/saya
```

Expected: User profile for demo farmer account.

## Running the App

### Start Development Server

```bash
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator  
- Scan QR code for physical device

### Important Notes

1. **Authentication**: The app uses demo tokens for testing:
   - Farmers: `demo-petani-1`, `demo-petani-2`
   - Buyers: `demo-pembeli-1` through `demo-pembeli-6`

2. **API Client**: All requests go through [`src/api/client.ts`](src/api/client.ts) which automatically:
   - Adds the `X-Terra-Token` header
   - Handles errors and 401 responses
   - Normalizes error messages

3. **Type Safety**: API types are generated from the backend's OpenAPI spec in [`src/api/schema.d.ts`](src/api/schema.d.ts)

## Switching Between Environments

### Local Development

To connect to a local backend instead:

1. Start the backend locally:
   ```bash
   cd ../TERRA-BE
   uvicorn terra.main:app --host 0.0.0.0 --port 8000
   ```

2. Update `.env`:
   ```bash
   # For Android emulator
   EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
   
   # For iOS simulator
   EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
   
   # For physical device (replace with your LAN IP)
   EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
   ```

3. Restart the Expo dev server

### Production

Already configured! The `.env` file points to the deployed backend.

## Troubleshooting

### "Cannot connect to server" Error

**Symptoms**: App shows connection error on startup

**Solutions**:
1. Verify backend is running: `curl https://terra-be.vercel.app/health`
2. Check if Vercel deployment is active
3. Ensure no typos in `EXPO_PUBLIC_API_URL`
4. Restart Expo dev server after changing `.env`

### 401 Unauthorized Errors

**Symptoms**: App immediately signs out or shows "Sesi tidak valid"

**Solutions**:
1. Verify you're using a valid demo token
2. Check backend logs for authentication issues
3. Try a different demo token

### 404 Not Found on Specific Endpoints

**Symptoms**: Some API calls fail with 404

**Possible causes**:
1. Backend module not deployed (check `/api/info` for installed modules)
2. Endpoint path mismatch between frontend and backend
3. Backend deployment issue

**Solution**: Compare [`src/api/endpoints.ts`](src/api/endpoints.ts) with backend's `/docs` (when available)

## API Endpoints Reference

All endpoints are defined in [`src/api/endpoints.ts`](src/api/endpoints.ts):

- **Onboarding**: `/onboarding/*` - Registration, profiles
- **Classification**: `/klasifikasi` - Photo classification
- **Listings**: `/penawaran/*`, `/permintaan/*` - Offers and demands
- **Matching**: `/penawaran/{id}/pembeli`, `/kecocokan/*` - Buyer matching
- **Recommendations**: `/penawaran/{id}/rekomendasi` - Disposal options
- **Trust**: `/transaksi/*`, `/laporan/*`, `/reputasi/*` - Transactions and reputation
- **Notifications**: `/notifikasi/*` - Alerts
- **Community**: `/penawaran/{id}/kartu`, `/komunitas/*` - Share cards and board
- **Impact**: `/dampak/*` - Impact dashboard

## Backend Status

**Deployment**: Vercel (https://terra-be.vercel.app)

**Known Placeholders** (as of backend analysis):
1. ✅ YOLO Classification - Mock implementation (deterministic results)
2. ✅ Push Notifications - Logged but not delivered (poll via `/notifikasi/saya`)
3. ✅ Image Storage - Fake URLs (images not persisted)

All other features are fully functional with real business logic.

## Next Steps

1. **Test the connection**: Run `npm start` and try signing in with `demo-petani-1`
2. **Verify flows**: Test the complete farmer flow (photo → classify → publish → matches)
3. **Check backend health**: Monitor `/health` endpoint for database connectivity
4. **Report issues**: If endpoints return 404, the backend may need redeployment

---

**Last Updated**: 2026-08-10  
**Backend Version**: 0.1.0  
**Frontend Version**: See package.json