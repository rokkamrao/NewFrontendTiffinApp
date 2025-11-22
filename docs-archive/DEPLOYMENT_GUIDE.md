# Deploy TiffinApp Live on Internet

## 🌍 **Frontend Deployment Options**

### **Option 1: Vercel (Recommended - Free)**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd "d:\Food Delivery app\tiffin-app"
vercel
```

3. **Configuration:** Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/tiffin-app/browser"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### **Option 2: Netlify (Free)**

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Deploy:**
```bash
netlify deploy --prod --dir=dist/tiffin-app/browser
```

3. **Configuration:** Create `netlify.toml`:
```toml
[build]
  publish = "dist/tiffin-app/browser"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **Option 3: Firebase Hosting (Free)**

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Initialize:**
```bash
firebase login
firebase init hosting
```

3. **Deploy:**
```bash
firebase deploy
```

## 🖥️ **Backend Deployment Options**

### **Option 1: Railway (Recommended - Free Tier)**

1. **Create account:** https://railway.app/
2. **Connect GitHub repository**
3. **Deploy Spring Boot app automatically**
4. **Environment variables:**
   - `PORT=8081`
   - `SPRING_DATASOURCE_URL=railway_postgres_url`
   - `SPRING_JPA_HIBERNATE_DDL_AUTO=update`

### **Option 2: Heroku (Free Tier)**

1. **Create `Procfile` in backend directory:**
```
web: java -jar target/tiffin-api.jar --server.port=$PORT
```

2. **Deploy:**
```bash
cd "d:\Food Delivery app\tiffin-api"
heroku create your-tiffin-api
heroku addons:create heroku-postgresql:hobby-dev
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### **Option 3: Render (Free)**

1. **Create account:** https://render.com/
2. **Connect repository**
3. **Configure:**
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/tiffin-api.jar`
   - Environment: `JAVA_VERSION=21`

## 🔗 **Database Options**

### **PostgreSQL Cloud (Free)**
- **Neon**: https://neon.tech/ (Free 500MB)
- **ElephantSQL**: https://www.elephantsql.com/ (Free 20MB)
- **Railway**: Included with backend hosting

## ⚙️ **Configuration Updates**

### **Update API URLs for Production**

1. **Frontend** - Update `environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.railway.app/api'
};
```

2. **Backend** - Update CORS settings:
```java
@CrossOrigin(origins = "https://your-frontend-url.vercel.app")
```

## 🚀 **Quick Deploy Commands**

### **Frontend (Vercel):**
```bash
npm install -g vercel
cd "d:\Food Delivery app\tiffin-app"
vercel
```

### **Backend (Railway):**
1. Push to GitHub
2. Connect to Railway
3. Auto-deploy

## 🌐 **Your Live URLs**
After deployment, you'll get URLs like:
- **Frontend**: `https://tiffin-app-xyz.vercel.app`
- **Backend**: `https://tiffin-api-xyz.railway.app`
- **Admin**: `https://tiffin-app-xyz.vercel.app/admin`

## 🎯 **Next Steps**
1. Choose your preferred platforms
2. Run the deployment commands
3. Update the API URLs
4. Test the live application