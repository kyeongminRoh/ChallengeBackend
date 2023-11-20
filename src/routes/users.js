import express from 'express'
import { prisma } from '../utils/prisma/index.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Prisma } from '@prisma/client'
import authMiddleware from '../middlewares/auth.middleware.js'


const router = express.Router()
// 회원가입 API
router.post('/sign-up', async (req, res, next) => {
    try {
    const { userName, password  } = req.body

    const user = await prisma.users.findFirst({
        where: { userName, password },
        //select: { userId: true }
    })
    if (user) {
        return res.status(409).json({ errorMessage: '이미 존재하는 아이디 입니다.' })
    }
        const hashedPassword = await bcrypt.hash(password, 5)
        const [ users ] = await prisma.$transaction(async (tx) => {

            const users = await tx.users.create({
                data: { 
                    userName,
                    password: hashedPassword
                }
                
            })
            return [users]
        }, {
            isolationLevel: Prisma.$transactionIsolationLevel.ReadCommitted
        }
        )
    return res.status(201).json({ message: "회원가입이 완료되었습니다." })
}catch (error){
    next(error)
}
})

// 로그인 API
router.post('/sign-in', async (req, res, next) => {
    try {
    const { userName, password } = req.body

    const user = await prisma.users.findFirst({
        where: { userName }
    })
    if(!user) {
        return res.status(401).json({ errorMessage: "존재하지 않는 아이디 입니다." })
    }
    const result = await bcrypt.compare( password, user.password )

    if (!result) {
        return res.status(401).json({ errorMessage: "일치하지 않는 비밀번호" })
    }
    const token = jwt.sign(
        {
        userId: user.userId
    },
    'secret_key'
    )
    res.cookie('authorization', `Bearer ${ token }`)
    return res.status(200).json({ message: "로그인에 성공했습니다." })
    }catch (error) {
        next(error)
    }
})



// 우저 정보API
router.get('/users/:userId',authMiddleware, async (req, res, next) => {
    const { userId } = req.user

    const user = await prisma.users.findFirst({
        where: { userId: userId},
        select: {
            userName: true,
            credit: true
        }
    })
    return res.status(201).json({ data: user })

})


export default router