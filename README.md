# ChallengeBackend

# 팀장 : 노경민
# 팀원 : 정윤영, 유재현

## ERD
![drawSQL-challenge1-export-2023-11-17](https://github.com/kyeongminRoh/ChallengeBackend/assets/140397466/33a4a801-edf7-41ae-a62b-92b388fdf4d7)


## API 명세서

### 회원가입 
#### POST '/signup'

##### body : name, password

/* 회원가입 성공 */
res : status(201).json{(message : "회원가입이 완료되었습니다" )}

/* 회원가입 실패*/
res.status(400).json{(message : "올바른 형식의 아이디와 비밀번호를 입력해주세요")}

### 로그인
#### POST '/signin'

##### body : name, password

/* 로그인 성공 */
res.status(201).json({message : "로그인에 성공하였습니다" )}

/* 로그인 실패 */
res.status(404).json({message : "등록되지 않은 유저입니다" )}
res.status(400).json({message : "아이디 혹은 비밀번호가 올바르지 않습니다" )}

### 예매
#### POST '/reservation/:showId'

#####params : showId

/* 예매 성공 */
res.status(201).json({message : `${shows.showId.name} 공연이 예매되었습니다` )}

/* 예매 실패 */
res.status(401).json({message : "매진된 공연입니다"})
