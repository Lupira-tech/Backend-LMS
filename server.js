import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./src/config/db.js";
import contactRoutes from "./src/routes/contact_Routes.js";
import dealRoutes from "./src/routes/deal_Routes.js";
const app=express()
dotenv.config()

// Connect to Database
connectDB()

const PORT=process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);

// Debug endpoint to test data reception
app.post('/api/debug', (req, res) => {
    console.log('🔍 Debug endpoint - Received data:', req.body);
    res.json({
        success: true,
        message: 'Debug endpoint received data',
        receivedData: req.body
    });
});

app.get('/',(req,res)=>{
    res.send("Hello lupira")
})

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})