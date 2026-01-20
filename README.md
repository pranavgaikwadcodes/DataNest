# DataNest 📦

<div align="center">
  <img src="assets/icon.png" alt="DataNest Logo" width="120" height="120">
  
  ### Organize Anything, Your Way
  
  A powerful mobile app for creating custom collections with dynamic fields to organize your data exactly how you want it.
  
  [![Made with Expo](https://img.shields.io/badge/Made%20with-Expo-000020.svg?style=flat&logo=expo)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com)
</div>

---

## ✨ Features

- 📋 **Custom Collections** - Create collections with any structure you need
- 🎨 **Color & Icons** - Personalize collections with colors and emojis
- ⭐ **Favorites** - Pin important collections to the top
- 🔍 **Search & Sort** - Find items instantly with powerful search and sorting
- ✏️ **Full CRUD** - Create, read, update, and delete items and collections
- 📄 **PDF Export** - Export any collection to a beautifully formatted PDF
- 🔐 **Authentication** - Secure sign-up/sign-in with persistent sessions
- ☁️ **Cloud Sync** - Your data syncs across all your devices
- 🚫 **No Ads** - Completely free with no advertisements

---

## 🛠️ Tech Stack

### Frontend
- **[React Native](https://reactnative.dev)** - Mobile framework
- **[Expo](https://expo.dev)** - Development platform and build service
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe JavaScript
- **[React Navigation](https://reactnavigation.org)** - Navigation library

### Backend & Database
- **[Supabase](https://supabase.com)** - Backend-as-a-Service
  - PostgreSQL database with JSONB for dynamic schemas
  - Row Level Security for data protection
  - Authentication with email/password

### State Management & Utilities
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[Zod](https://github.com/colinhacks/zod)** - Runtime validation
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Persistent session storage
- **[Expo Print](https://docs.expo.dev/versions/latest/sdk/print/)** - PDF generation
- **[React Native Keyboard Aware ScrollView](https://github.com/APSL/react-native-keyboard-aware-scroll-view)** - Better keyboard handling

---

## 📱 Screenshots

<div align="center">
  <img src="screenshots/home.png" width="200" alt="Home Screen">
  <img src="screenshots/collection.png" width="200" alt="Collection Detail">
  <img src="screenshots/create.png" width="200" alt="Create Collection">
  <img src="screenshots/edit.png" width="200" alt="Edit Item">
</div>

*Add your screenshots in a `screenshots/` folder*

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- [Supabase account](https://supabase.com) (free tier works)
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/datanest.git
   cd datanest
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up Supabase**
   
   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Run this SQL in the SQL Editor:
```sql
   -- Create lists table
   CREATE TABLE lists (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     schema JSONB NOT NULL,
     user_id UUID REFERENCES auth.users(id) NOT NULL,
     is_favorite BOOLEAN DEFAULT false,
     color TEXT DEFAULT '#3b82f6',
     icon TEXT DEFAULT '📦',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
   );

   -- Create items table
   CREATE TABLE items (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
     data JSONB NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
   );

   -- Enable Row Level Security
   ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
   ALTER TABLE items ENABLE ROW LEVEL SECURITY;

   -- RLS Policies for lists
   CREATE POLICY "Users can view their own lists" ON lists FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert their own lists" ON lists FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update their own lists" ON lists FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can delete their own lists" ON lists FOR DELETE USING (auth.uid() = user_id);

   -- RLS Policies for items
   CREATE POLICY "Users can view items from their own lists" ON items FOR SELECT 
     USING (EXISTS (SELECT 1 FROM lists WHERE lists.id = items.list_id AND lists.user_id = auth.uid()));
   CREATE POLICY "Users can insert items to their own lists" ON items FOR INSERT 
     WITH CHECK (EXISTS (SELECT 1 FROM lists WHERE lists.id = items.list_id AND lists.user_id = auth.uid()));
   CREATE POLICY "Users can update items from their own lists" ON items FOR UPDATE 
     USING (EXISTS (SELECT 1 FROM lists WHERE lists.id = items.list_id AND lists.user_id = auth.uid()));
   CREATE POLICY "Users can delete items from their own lists" ON items FOR DELETE 
     USING (EXISTS (SELECT 1 FROM lists WHERE lists.id = items.list_id AND lists.user_id = auth.uid()));
```

4. **Configure environment variables**
   
   Create a `.env` file in the root:
```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```
   
   Get these values from: Supabase Dashboard → Settings → API

5. **Run the app**
```bash
   npx expo start
```
   
   Then press:
   - `i` for iOS simulator
   - `a` for Android emulator
   - Scan QR code with Expo Go app

---

## 📦 Building for Production

### Build APK/AAB with EAS

1. **Install EAS CLI**
```bash
   npm install -g eas-cli
```

2. **Login to Expo**
```bash
   eas login
```

3. **Configure project**
```bash
   eas build:configure
```

4. **Build preview APK** (for testing)
```bash
   eas build --platform android --profile preview
```

5. **Build production AAB** (for Play Store)
```bash
   eas build --platform android --profile production
```

---

## 📁 Project Structure
```
datanest/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ColorPicker.tsx
│   │   └── IconPicker.tsx
│   ├── lib/              # External service configurations
│   │   └── supabase.ts
│   ├── navigation/       # Navigation types
│   │   └── types.ts
│   ├── screens/          # App screens
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── CreateListScreen.tsx
│   │   ├── EditListScreen.tsx
│   │   ├── ListDetailScreen.tsx
│   │   ├── AddItemScreen.tsx
│   │   └── EditItemScreen.tsx
│   ├── stores/           # Zustand state management
│   │   ├── authStore.ts
│   │   └── listStore.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── utils/            # Utility functions
│       └── pdfExport.ts
├── assets/               # Images, fonts, icons
├── .env.example          # Environment variables template
├── app.json              # Expo configuration
├── eas.json              # EAS Build configuration
├── package.json          # Dependencies
└── App.tsx               # Root component
```

---

## 🎨 Use Cases

DataNest is perfect for organizing:

- 📇 **Contacts** - Name, phone, email, birthday
- 📚 **Books** - Title, author, rating, finished date
- 🎬 **Movies** - Title, director, watched date, rating
- 🍳 **Recipes** - Name, ingredients, cook time, difficulty
- ✅ **Tasks** - Task name, priority, due date, completed
- 💼 **Job Applications** - Company, position, status, date
- 🎮 **Game Collection** - Title, platform, completion status
- 🏋️ **Workouts** - Exercise, sets, reps, weight
- 🌍 **Travel Plans** - Destination, dates, budget, visited
- ...and literally anything else!

---

## 🔒 Privacy & Security

- All user data is encrypted in transit (HTTPS/TLS)
- Passwords are securely hashed using Supabase Auth
- Row Level Security ensures users can only access their own data
- No third-party tracking or analytics
- Privacy Policy: [View Here](https://pranavgaikwadcodes.github.io/DataNest/privacy-policy.html)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**

- GitHub: [@pranavgaikwadcodes](https://github.com/pranavgaikwadcodes)
- Email: work.pranavgaikwad@gmail.com

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev) for the amazing development platform
- [Supabase](https://supabase.com) for the backend infrastructure
- [React Navigation](https://reactnavigation.org) for seamless navigation
- All open-source contributors who made this possible

---

## 📱 Download

Coming soon to Google Play Store!

---

<div align="center">
  Made with ❤️ and ☕
</div>
