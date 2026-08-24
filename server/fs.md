server/
├── src/
│   ├── config/
│   │   └── env.ts 
│   │
│   ├── db/
│   │   ├── connection.ts             
│   │   └── models/
│   │       ├── userModel.ts          
│   │       ├── taskModel.ts
│   │       ├── taskCollaboratorModel.ts
│   │       ├── messageModel.ts
│   │       ├── notificationModel.ts
│   │       └── index.ts              
│   │
│   ├── interceptors/
│   │   └── authInterceptor.ts        
│   │
│   ├── service/
│   │   ├── authService.ts            
│   │   ├── taskService.ts
│   │   ├── taskCollaboratorService.ts
│   │   ├── messageService.ts
│   │   └── notificationService.ts
│   │
│   ├── repository/
│   │   ├── userRepository.ts         
│   │   ├── taskRepository.ts
│   │   ├── taskCollaboratorRepository.ts
│   │   ├── messageRepository.ts
│   │   └── notificationRepository.ts
│   │
│   ├── transport/
│   │   └── handlers/
│   │       ├── authHandler.ts        
│   │       ├── taskHandler.ts        
│   │       ├── taskCollaboratorHandler.ts
│   │       ├── messageHandler.ts
│   │       └── notificationHandler.ts
│   │
│   ├── utils/
│   │   └── jwt.ts                    
│   │
│   └── server.ts                    
│
├── .env                              
├── .env.example
├── package.json
├── tsconfig.json
└── README.md