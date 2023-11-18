import express from 'express'
import userRouter from './routes/users.js'
import ErrorhandlerMiddleware from './middlewares/error.middleware.js';
import logmiddleware from './middlewares/logmiddleware.js';
import cookieParser from 'cookie-parser';
import Reservation from './routes/reservation.js'


const app = express()
const PORT = 3000

app.use(express.json())
app.use(logmiddleware)
app.use(cookieParser())
app.use(ErrorhandlerMiddleware)
app.use('/api', [userRouter, Reservation])


app.listen(PORT, () => {
    console.log(PORT, "Serber Open")
})

export default app