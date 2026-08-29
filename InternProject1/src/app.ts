import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes/authRoutes';
import taskrouter from './routes/taskRoutes';
import taskCollaboratorRouter from './routes/taskCollaboratorRoutes';
import messageRoutes from './routes/messageRoutes';
import errorHandler from './middlewares/errormiddleware';
import notifroutes from './routes/notificationRoutes';
import path from 'path';


const app = express();

const allowedOrigins = ['http://127.0.0.1:5500','http://localhost:5500','http://127.0.0.1:3000','http://localhost:3000'];
const corsOptions: cors.CorsOptions = {
    // 1. Only allow specific frontend domains
         origin: (origin, callback) => {
        // !origin allows server-to-server or tools like Postman to work
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
        } else {
        callback(new Error('Blocked by CORS policy'));
        }
    },
    //this allows frontend to send cookies or authorization headers
    credentials:true,
    //limit the methods to the requirements only
    methods:['GET','PUT','POST','PATCH','DELETE'],
    //Headers the client is allowed to send
    allowedHeaders:['Content-Type','Authorization','X-Device-ID'],
    //headers the client browser is allowed to read from the server response
    exposedHeaders:['RateLimit-Limit','RateLimit-Remaining','RateLimit-Reset']
    
}


// Configure custom Helmet security policies
// app.use(
//       helmet({
//         // 1. Content Security Policy configuration
//         contentSecurityPolicy: {
//               directives: {
//                     defaultSrc: ["'self'"], // By default, only trust data from your own domain
//                     scriptSrc: ["'self'", "'trusted-cdn.com'"], // Allowed script locations
//                     styleSrc: ["'self'", "'://googleapis.com'", "'unsafe-inline'"], // Allowed CSS styling locations
//                     fontSrc: ["'self'", "'://gstatic.com'"], // Allowed font origins
//                     imgSrc: ["'self'", "data:", "https://unsplash.com"], // Allowed image asset origins
//                     connectSrc: ["'self'",
//                                 "http://127.0.0.1:3000",   // ← API calls
//                                 "http://localhost:3000",
//                                 "ws://127.0.0.1:3000",      // ← Socket.IO
//                                 "wss://127.0.0.1:3000",],
//                     objectSrc: ["'none'"], // Blocks vulnerable flash/plugins
//                     upgradeInsecureRequests: [], // Automatically forces HTTP links to upgrade to HTTPS
                      
//                 },
//                 },
                
//                 // 2. Cross-Origin configurations (Adjust if external images/scripts break)
//                 crossOriginEmbedderPolicy: false, 
//     crossOriginOpenerPolicy: { policy: "same-origin" },

//     // 3. Prevent Clickjacking
//     xFrameOptions: { action: "deny" },
    
//     // 4. Force HTTPS (Lasts for 1 year)
//     strictTransportSecurity: {
//           maxAge: 31536000,
//           includeSubDomains: true,
//       preload: true,
//     },

//     // 5. Explicitly block browsers from sniffing content types away from what the server declares
//     xContentTypeOptions: true,
//       })
//     );


app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'","https://cdn.socket.io"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrcAttr: ["'unsafe-hashes'","'sha256-B2kKObP1ttXxP4bc+z1ri7AcQKmY+Pws7G9VEvdlfHI='"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: [
          "'self'",
          "http://127.0.0.1:3000",
          "http://localhost:3000",
          "ws://127.0.0.1:3000",
          "wss://127.0.0.1:3000",
        ],
      },
    },
  })
);
    
    // app.use(helmet()); 
app.use(express.json());
app.use(cors(corsOptions))
// app.use(cors());
// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client')));

// Fallback to index.html for SPA routes
// app.get('/', (req, res) => {
  // res.sendFile(path.join(__dirname, '../client/index.html'));
// });
// app.use(express.static(path.join(process.cwd(), 'client')));

// Routes
app.use('/api/v1/auth', router);
app.use('/api/v1/tasks', taskCollaboratorRouter);
app.use('/api/v1/tasks', messageRoutes);
app.use('/api/v1/tasks', taskrouter);
app.use('/api/v1/notifications', notifroutes);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'app running smoothly' });
});

// Error handling middleware 
app.use(errorHandler);

export default app;
