import jwt from 'jsonwebtoken' //2 
import { prisma } from '../utils/prisma/index.js'

export default async function (req, res, next) {
    try {
    //1. 클라이언트로 부터 **쿠키(Cookie)**를 전달받습니다.
    const { authorization } = req.cookies // 쿠키즉 authorization 을가지고 오기
    
    if (!authorization) {
        res.status(404).json({ errorMessage: "토큰 이 존재하지 않습니다. "})
    }
    //2. **쿠키(Cookie)**가 **Bearer 토큰** 형식인지 확인합니다.
    const[tokenType, token] = authorization.split(' ') //  이걸잘라줌 =>Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY5OTU4ODg2N30._g_sLm9UkJSnhulKOXUd-cpjjErrMCdNe2rpK4SKBZg 
    if (tokenType !== 'Bearer') throw new Error('토큰 타입이 일치하지 않습니다.')// throw new Error 에러를 catch 부분으로 내림
    //3. 서버에서 발급한 **JWT가 맞는지 검증**합니다.
    const decodedToken = jwt.verify(token, 'secret_key')// 1 jwt 토큰을 사용하기 위해 임포트로 가져오기 verify 검증할수있는 함수
    const userId = decodedToken.userId
    
    //4. JWT의 `userId`를 이용해 사용자를 조회합니다.
    const user = await prisma.users.findFirst({
        where: { userId: +userId }
    })
    if(!user) {
        res.clearCookie('authorization')
        throw new Error ("토큰 사용자가 존재하지 않습니다.") // catch 부분으로 에러를 내림
    // } else if (user.usertype === 'COUSTOMER') {
    //     return res.status(400).json({ errorMessage: " 권한이 없다. "})
    }
    //5. `req.user` 에 조회된 사용자 정보를 할당합니다.
    req.user = user
    
    //6. 다음 미들웨어를 실행합니다.
    next()

    }catch (error) {
        res.clearCookie('authorization')// 특정쿠키 삭제 

        return res.status(401).json({ errorMessage: error.message ?? '비 정상적인 요청입니다.' }) // 위에 토큰타입이 일치하지 않으면 왼쪽 아니면 오른쪽 출력
    }
    }
