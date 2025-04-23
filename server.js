const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

// ✅ Initialize Firebase Admin SDK
const serviceAccount = require("./firebase-adminsdk.json"); // Replace with your actual Firebase Admin SDK JSON file
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://smart-site-3ff43.firebaseio.com" // Replace with your Firebase project DB URL
});

const db = admin.firestore();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON requests
app.use(session({
    secret: "smartsite-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Change to true if using HTTPS
}));

// ✅ Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Role-Based Dashboard Paths
const roleRoutes = {
    "operative": "/operative/operative-dashboard.html",
    "contractor": "/contractor/contractor-dashboard.html",
    "subcontractor": "/subcontractor/subcontractor-dashboard.html",
    "supplier": "/supplier/supplier-dashboard.html",
    "architect": "/architect/architect-dashboard.html"
};

// ✅ Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "public", "register.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));

// ✅ Role-Based Dashboard Redirection
app.get("/dashboard", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    const userId = req.session.user.uid;
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.send("User data not found. Contact support.");
        }

        const userRole = userDoc.data().role;
        return res.redirect(roleRoutes[userRole] || "/login");
    } catch (error) {
        console.error("Error fetching user role:", error);
        return res.send("Error retrieving user data. Contact support.");
    }
});

// ✅ Register User & Save Role in Firestore
app.post("/register", async (req, res) => {
    const { email, password, role } = req.body;
    
    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password
        });

        await db.collection("users").doc(userRecord.uid).set({
            email: email,
            role: role
        });

        req.session.user = { uid: userRecord.uid, email: email, role: role };
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Error registering user:", error);
        res.send("Registration failed. Try again.");
    }
});

// ✅ Handle Login & Session
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const userDoc = await db.collection("users").doc(userRecord.uid).get();

        if (!userDoc.exists) {
            return res.send("No user data found. Contact support.");
        }

        req.session.user = { uid: userRecord.uid, email: email, role: userDoc.data().role };
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Login error:", error);
        res.send("Invalid credentials. Try again.");
    }
});

// ✅ Handle Logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

// ✅ Serve Role-Based Static Dashboards
app.use("/operative", express.static(path.join(__dirname, "public", "operative")));
app.use("/contractor", express.static(path.join(__dirname, "public", "contractor")));
app.use("/subcontractor", express.static(path.join(__dirname, "public", "subcontractor")));
app.use("/supplier", express.static(path.join(__dirname, "public", "supplier")));
app.use("/architect", express.static(path.join(__dirname, "public", "architect")));

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
