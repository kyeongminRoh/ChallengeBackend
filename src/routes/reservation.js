import express from 'express'
import { prisma } from '../utils/prisma/index.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import { Prisma } from '@prisma/client'


const router = express.Router()
// 공연 등록
router.post ('/shows', async (req, res) => {
    const { showName, location, posterURL, quantity, price } = req.body

    const show = await prisma.shows.create({
        data: {
            showName,
            location,
            posterURL,
            quantity,
            price
        }
    })
    return res.status(201).json({ data: show })
})
// 공연 상세 조회 API
router.get('/shows/:showId', async (req, res, next) => {
    try {
        const { showId } = req.params;

        const show = await prisma.shows.findFirst({
            where: { showId: +showId },
            select: {
                showId: true,
                showName: true,
                location: true,
                date: true,
                price: true,
                quantity: true,
                posterURL: true
            }
        });

        if (!show) {
            return res.status(404).json({ errorMessage: "존재하는 데이터가 없습니다." });
        }

        return res.status(200).json({ data: show });
    } catch (error) {
        next(error);
    }
});

// 예약 APi
router.post('/reservation/:showId', authMiddleware, async (req, res, next) => {
    try {
    const { showId } = req.params
    const { userId } = req.user
        
    const [ show ] = await prisma.$transaction(async (tx) => {

        const show = await tx.shows.findFirst({
            where: { showId: +showId },
            
        })
        const user = await tx.users.findFirst({
            where: { userId: userId }
        })

    
        if (!show || show.quantity <= 0) {
            return res.status(401).json({ errorMessage: "매진된 공연입니다." })
        }
        if (user.credit < show.price) {
        return res.status(402).json({ errorMessage: "크레딧이 부족합니다." });
        }
        await tx.users.update({
            where: { userId: userId },
            data: { credit: user.credit - show.price },
        });

        const changeQuantity = show.quantity -1
        await tx.shows.update({
            where: { showId: +showId },
            data: { quantity: changeQuantity }
        })
        
        await tx.reservation.create({
            data: {
                UserId: +userId,
                ShowId: +showId
            }
        })

        return [ show ]
    },{
        //isolationLevel: Prisma.$transactionIsolationLevel.ReadCommitted
    })
    return res.status(201).json({ message: `${show.showName}예약 되었습니다.` })
}catch(error) {
    next(error)
}
})

// 예매조회 API
router.get('/reservation/:showId',authMiddleware, async (req, res, next) => {
    try {
        const { showId } = req.params
        const { userId } = req.user
    
    

    const reservation = await prisma.reservation.findFirst({
        where: { ShowId: +showId, UserId: userId }
    })
    
    if(!reservation) {
        return res.status(404).json({ errorMessage: "존재하는 데이터가 없습니다." })
    }

    const show = await prisma.shows.findMany({
        where: { showId: reservation.ShowId },
        select: {
            showId: true,
            showName: true,
            location: true,
            quantity: true,
            date: true,
            price: true
        }
    })
    return res.status(200).json({ data: show })
}catch (error) {
    next(error)
}
})





export default router