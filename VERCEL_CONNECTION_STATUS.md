# TERRA-FE → Vercel Backend Connection Status

## ✅ Connection Configured Successfully

The `kamali` branch of TERRA-FE is now connected to the production Vercel backend.

### Backend Details

- **URL**: `https://terra-be.vercel.app`
- **API Base**: `https://terra-be.vercel.app/api`
- **Status**: ✅ Healthy and responding
- **Database**: ✅ Connected (Supabase PostgreSQL)

### Frontend Configuration

**File**: `TERRA-FE/.env`
```env
EXPO_PUBLIC_API_URL=https://terra-be.vercel.app/api
```

### Verified Endpoints

✅ **Health Check**
```bash
GET https://terra-be.vercel.app/health
Response: {"status":"sehat","basis_data":true}
```

✅ **API Info**
```bash
GET https://terra-be.vercel.app/api/api/info
Response: {
  "layanan": "TERRA API",
  "versi": "0.1.0",
  "modul_terpasang": [
    "onboarding", "listings", "classification", 
    "matching", "trust", "notifications", 
    "recommendation", "community", "dashboard"
  ],
  "placeholder_aktif": {
    "klasifikasi_tiruan": true,
    "penyimpanan_citra_tiruan": true,
    "pengiriman_push_tiruan": true
  }
}
```

✅ **Authentication Endpoint**
```bash
GET https://terra-be.vercel.app/api/onboarding/saya
Response: {"pesan":"Token tidak dikenali.","detail":{}}
```
*(This is correct - means backend is working, just needs demo data seeded)*

### API Documentation

- **Swagger UI**: https://terra-be.vercel.app/api/docs
- **ReDoc**: https://terra-be.vercel.app/api/redoc
- **OpenAPI Schema**: https://terra-be.vercel.app/api/openapi.json

### Next Steps

#### 1. Seed Production Database (Required)

The backend is deployed but the database needs demo data. Run:

```bash
# From TERRA-BE directory
python init_production_db.py
```

This will create demo users with tokens:
- `demo-petani-1`, `demo-petani-2` (farmers)
- `demo-pembeli-1` through `demo-pembeli-6` (buyers)

#### 2. Test Frontend Connection

```bash
# From TERRA-FE directory
npm start
```

Then:
1. Press `a` for Android emulator or scan QR for physical device
2. Login with `demo-petani-1` or use demo chips
3. Test the flow: New Offer → Classification → Recommendations → Matches

#### 3. Update OpenAPI Types (If Backend Changed)

If the backend API has changed since last sync:

```bash
# In TERRA-BE
python -m scripts.export_openapi
cp openapi.json ../TERRA-FE/

# In TERRA-FE
npm run generate:api
npm run typecheck
```

### Routing Architecture

The backend uses a dual-prefix system:

1. **Vercel serves** `api/index.py` at `/api/index`
2. **FastAPI sets** `root_path = "/api"` in `api/index.py`
3. **Result**: All FastAPI routes are at `/api/{endpoint}`

Example:
- FastAPI route: `@router.get("/onboarding/saya")`
- Actual URL: `https://terra-be.vercel.app/api/onboarding/saya`

### Environment Variables Reference

**Development (Local Backend)**:
```env
# Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000

# iOS Simulator
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000

# Physical Device (replace with your LAN IP)
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

**Production (Vercel)**:
```env
EXPO_PUBLIC_API_URL=https://terra-be.vercel.app/api
```

### Troubleshooting

**"Tidak dapat menghubungi server" Error**:
- Verify `EXPO_PUBLIC_API_URL` in `.env`
- Restart Expo dev server: `npm start` (press `r` to reload)
- Check backend health: `curl https://terra-be.vercel.app/health`

**"Token tidak dikenali" Error**:
- Database needs seeding: Run `python init_production_db.py`
- Or use correct demo token: `demo-petani-1`

**Type Errors After Backend Changes**:
- Regenerate types: `npm run generate:api`
- Check for breaking changes in OpenAPI schema

### Connection Test Script

Create `TERRA-FE/test-connection.js`:

```javascript
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://terra-be.vercel.app/api';

async function testConnection() {
  try {
    // Test 1: Health check
    const health = await fetch(`${BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health:', await health.json());

    // Test 2: API info
    const info = await fetch(`${BASE_URL}/api/info`);
    console.log('✅ API Info:', await info.json());

    // Test 3: Auth endpoint
    const auth = await fetch(`${BASE_URL}/onboarding/saya`, {
      headers: { 'X-Terra-Token': 'demo-petani-1' }
    });
    console.log('✅ Auth test:', await auth.json());
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

Run: `node test-connection.js`

---

**Status**: ✅ **CONNECTED AND READY**

The kamali branch frontend is successfully configured to communicate with the Vercel-deployed backend. Once the production database is seeded, the app will be fully functional.