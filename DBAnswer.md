# DB 실습 문제
## 문제 1: 테이블 생성하기 (CREATE TABLE)
1) attendance 테이블은 중복된 데이터가 쌓이는 구조이다. 중복된 데이터는 어떤 컬럼인가?
- crew_id와 nickname
2) attendance 테이블에서 중복을 제거하기 위해 crew 테이블을 만들려고 한다. 어떻게 구성해 볼 수 있을까?
- crew 테이블에 crew_id와 nickname 컬럼을 만든다.
3) crew 테이블에 들어가야 할 크루들의 정보는 어떻게 추출할까? (hint: DISTINCT)
```
SELECT distinct crew_id, nickname from attendance;
```
4) 최종적으로 crew 테이블 생성:
```
CREATE TABLE crew (
  crew_id INT NOT NULL AUTO_INCREMENT,
  nickname VARCHAR(50) NOT NULL,
  PRIMARY KEY (crew_id)
);
```
5) attendance 테이블에서 크루 정보를 추출해서 crew 테이블에 삽입하기:
```
INSERT INTO crew (crew_id, nickname)
SELECT DISTINCT crew_id, nickname FROM attendance;
```

## 문제 2: 테이블 컬럼 삭제하기 (ALTER TABLE)
1) crew 테이블을 만들고 중복을 제거했다. attendance에서 불필요해지는 컬럼은?
- nickname
2) 컬럼을 삭제하려면 어떻게 해야 하는가?
```
ALTER TABLE attendance DROP COLUMN nickname;
```

## 문제 3: 외래키 설정하기
1) attendance에서 관심사의 분리를 통해 crew 테이블을 별도로 만들었다. 따라서, 나중에 nickname이 필요하다면 crew 테이블에서 확인하면 된다. 그런데 잠재적인 문제가 남아 있다:
- 만약에 crew 테이블에는 crew_id가 12번인 크루가 존재하지 않지만, attendance 테이블에는 여전히 crew_id가 12번인 크루가 존재한다면?
    - 해당 크루가 중간에 퇴소했거나
    - 누군가의 실수에 의해 레코드가 삭제되었거나
```
ALTER TABLE attendance
ADD FOREIGN KEY (crew_id) REFERENCES crew(crew_id)
ON DELETE CASCADE
ON UPDATE CASCADE;
```

## 문제 4: 유니크 키 설정
1) 우아한테크코스에서는 닉네임의 '중복'이 엄연히 금지된다. 그런데 현재 테이블에는 중복된 닉네임이 담길 수 있다. crew 테이블의 결함을 어떻게 해결할 수 있을까?
```
ALTER TABLE crew ADD UNIQUE (nickname);
```

## 문제 5: 크루 닉네임 검색하기 (LIKE)
1) 3월 4일, 아침에 검프에게 어떤 크루가 상냥하게 인사했다. 그런데 검프도 구면인 것 같아서 닉네임 첫 글자가 디라는 건 떠올랐는데... 누구지?
```
SELECT nickname FROM crew WHERE nickname LIKE '디%';
```

## 문제 6: 출석 기록 확인하기 (SELECT + WHERE)
1) 성실의 아이콘 어셔는 등굣길에 스마트폰을 떨어뜨리는 바람에 3월 6일에 등교/하교 버튼을 누르지 못했다. 담당 코치에게 빠르게 공유한 그를 구제하기 위해 검프가 출석 처리를 해 주려고 한다.
어셔: 안녕하세요 검프. 저는 3월 6일 09시 31분에 등교하고 18시 01분에 하교했습니다. 감사합니다.
검프: 네 ^^;;; (이거 어쩌나...)
일단, 정말로 어셔의 기록이 누락됐는지부터 확인해 보자.
```
SELECT a.start_time, a.end_time 
FROM attendance a JOIN crew c 
ON a.crew_id = c.crew_id
WHERE c.nickname = '어셔' 
  AND a.attendance_date = '2025-03-06';
```

## 문제 7: 누락된 출석 기록 추가 (INSERT)
1) 확인해 보니, 어셔는 그날 출석 체크를 하지 못한 것이 사실로 드러났다. 사후 처리를 위해 출석을 추가해야 하는데 어떻게 추가해야 할까?
```
INSERT INTO attendance (crew_id, nickname, attendance_date, start_time, end_time) VALUES

  -- 어셔(crew_id=13)
  (13, '어셔', '2025-03-06', '09:31', '18:01');
```

## 문제 8: 잘못된 출석 기록 수정 (UPDATE)
1) 주니는 3월 12일 10시 정각에 캠퍼스에 도착했지만, 등교 버튼을 누르는 것을 깜빡하고 데일리 미팅에 참여했다. 뒤늦게야 알게 됐는데 시각은 10시 5분... 지각 처리가 되는 시점이었다.
주니: 검프~! 제가 3월 12일 10시 정각에 캠퍼스에 도착했는데 깜빡하고 등교 버튼을 늦게 눌렀어요. 나중에 확인해 보니까 10시 5분이더라구욥ㅠ 👉🏻👈🏻 ... 죄송한데 한 번만 출석 처리 해주실 수 있을까욥??? 🥹🥹
검프: 네 ^^;;; (그냥 지각 처리하면 안 되나ㅠㅠ)
```
UPDATE attendance a JOIN crew c 
ON a.crew_id = c.crew_id
SET a.start_time = '10:00:00'
WHERE c.nickname = '주니' 
  AND a.attendance_date = '2025-03-12';
```

## 문제 9: 허위 출석 기록 삭제 (DELETE)
1) 시력은 좋지 않지만, 평소 눈썰미가 좋은 검프는 아론이 3월 12일에 캠퍼스에 도착하지 않은 점을 깨달았다. 그런데 무슨 이유에서인지 그날 출석 처리가 되어 있는 것을 우연히 발견했다.

검프: 아론...? 3월 12일에는 안 나오셨잖아요? 그날 구구한테 물어보니까 안 나오셨다던데...
아론: 앗.. 죄송해요 ㅜㅜ
검프: 해당 기록은 제가 지우겠습니다..

warning: 실습을 위해 연출된 상황이며, 실제로 허위 출석을 시도하는 경우 Honor Code 위반으로 즉시 퇴소 조치된다.
```
DELETE a
FROM attendance a JOIN crew c 
ON a.crew_id = c.crew_id
WHERE c.nickname = '아론'
  AND a.attendance_date = '2025-03-12';
```

## 문제 10: 출석 정보 조회하기 (JOIN)
1) 검프는 SQL이 익숙지 않아 crew 테이블에서 먼저 닉네임을 검색하고 해당 아이디 값을 찾아 직접 WHERE문에서 crew_id 항목의 값을 수동으로 입력해서 출석 기록을 조회했다. 그런데 crew 테이블에서 crew_id를 기준으로 nickname 필드 값을 가져와서 함께 조회할 수도 있지 않을까?
```
SELECT c.nickname a.attendance_date
FROM attendance a JOIN crew c
ON a.crew_id = c.crew_id;
```

## 문제 11: nickname으로 쿼리 처리하기 (서브 쿼리)
1) 검프는 SQL이 익숙지 않아 crew 테이블에서 먼저 닉네임을 검색하고 해당 아이디 값을 찾아 직접 WHERE문에서 crew_id 항목의 값을 수동으로 입력했다. 그런데 nickname을 입력하면 이를 기준으로 쿼리문을 처리할 수도 있지 않을까?
```
SELECT attendance_date
FROM attendance
WHERE crew_id = (SELECT crew_id FROM crew WHERE nickname = '검프');
```

## 문제 12: 가장 늦게 하교한 크루 찾기
1) 3월 6일, 검프는 우연히 아침에 일찍 눈을 떴다. 상쾌하게 일찍 출근하기로 마음을 먹고 캠퍼스로 향했다. 검프가 가장 먼저 도착했다. 하지만, 경비 처리가 되어 있지 않은 걸 확인했다. 전날(3월 5일) 가장 늦게 하교한 크루를 찾아 DM을 보내려고 하는데 크루의 닉네임과 하교 시각은 어떻게 찾을 수 있을까?
```
SELECT c.nickname, a.end_time
FROM attendance a JOIN crew c 
ON a.crew_id = c.crew_id
WHERE a.attendance_date = '2025-03-05'
ORDER BY a.end_time DESC
LIMIT 1;
```

## 문제 13: 크루별로 '기록된' 날짜 수 조회
```
SELECT crew_id, COUNT(DISTINCT attendance_date)
FROM attendance
GROUP BY crew_id;
```

## 문제 14: 크루별로 등교 기록이 있는(start_time IS NOT NULL) 날짜 수 조회
```
SELECT crew_id COUNT(DISTINCT attendance_date)
FROM attendance
WHERE start time IS NOT NULL
GROUP BY crew_id;
```

## 문제 15: 날짜별로 등교한 크루 수 조회
```
SELECT attendance_date, COUNT(DISTINCT crew_id)
FROM attendance
WHERE start_time IS NOT NULL
GROUP BY attendance_date;
```

## 문제 16: 크루별 가장 빠른 등교 시각(MIN)과 가장 늦은 등교 시각(MAX)
```
SELECT crew_id, MIN(start_time), MAX(start_time)
FROM attendance
WHERE start_time IS NOT NULL
GROUP BY crew_id;
```

# 생각해보기
## SQL 실습 관련
1. 기본키란 무엇이고 왜 필요한가?
- 출제 의도: 테이블에서 각 레코드를 고유하게 식별하는 기본키의 개념과 중요성을 이해해보자. 실제 데이터를 다룰 때 식별자가 없다면 어떤 문제가 발생할지 생각해보고, 기본키 선택이 데이터베이스 설계에 미치는 영향을 고민해보자.

- 개념: 테이블 내의 각 행을 유일하게 식별할 수 있는 고유한 값 (예: 주민등록번호, 학번)
- 필요성: 기본키가 없으면 데이터의 중복을 막을 수 없고, 특정 사람의 데이터를 정확히 찾아 수정하거나 삭제할 수 없다. 동명이인이 있을 때 어떤 사람인지 DB는 알 수 없게 된다. 기본키는 데이터의 무결성(정확성)을 지키는 최후의 보루.

2. MySQL에서 사용되는 AUTO_INCREMENT는 왜 필요할까?
- 출제 의도: 일일이 ID 값을 지정해야 하는 번거로움을 줄이고 중복 없는 고유값을 자동으로 생성하는 기능의 필요성을 파악해보자.

- 필요성: 다수의 사용자가 동시에 데이터를 입력할 때 직접 ID를 매기면 중복 ID가 발생하여 충돌(에러)이 일어날 수 있다. DB가 알아서 겹치지 않게 순서대로 번호를 발급해 주어 동시성 문제와 입력의 번거로움을 원천 차단한다.

3. 학생이 등교는 했지만 하교 버튼을 누르지 않았을 때, end_time에 NULL이 저장된다. NULL 값을 처리할 때 주의할 점은?
- 출제 의도: NULL 처리는 SQL 학습에서 자주 혼란을 주는 개념이다. 특히 프론트엔드에서 NULL 데이터를 어떻게 표시할지는 실무적으로 중요한 문제이다.

- DB 측면: SQL에서 NULL은 '0'이나 '빈 칸'이 아닌 '알 수 없음(Unknown)'을 의미한다. 따라서 조건문 검색 시 =가 아니라 반드시 IS NULL이나 IS NOT NULL을 사용해야 한다.

- 앱 측면: 프론트엔드에서 NULL 값을 그대로 화면에 출력하면 에러가 나거나 "null"이라는 문자가 노출된다. "하교 전"이나 "-" 등으로 변환하여 보여주는 예외 처리가 필수적이다.

4. crew와 attendance 테이블의 관계를 ER 다이어그램으로 시각화해보자. 이 관계를 일상 생활의 예시로 비유한다면 어떤 것이 있을까?
- 출제 의도: 일대다 관계를 실생활에서 찾아보면서(예: 학생-수강과목, 고객-주문 등) 관계형 모델의 기본 개념을 체득해보자.

- 관계: crew (1) : attendance (N)의 일대다(1:N) 관계다.
- 비유: 한 명의 고객(1)이 여러 번 배달 음식을 주문(N)하는 것, 또는 한 명의 유저(1)가 여러 개의 게시글(N)을 작성하는 것과 같다.

## 공통강의 DB 개념 연결
5. 출석 시스템에서 동시에 100명이 등교 버튼을 누른다면 어떤 일이 일어날까? 이 문제를 2026 공통강의 - DB에서 배운 트랜잭션과 ACID 속성으로 설명해보자.
- 출제 의도: 실습에서 직접 다룬 INSERT/UPDATE가 실제 운영 환경에서는 동시성 문제를 일으킬 수 있다. 원자성(Atomicity)과 격리성(Isolation)이 왜 필요한지 출석 시스템의 맥락에서 구체적으로 떠올려보자.

- 상황: 순간적으로 100개의 데이터 삽입(INSERT) 요청이 쏟아진다.
- 원자성(Atomicity): 출석 기록과 포인트 적립이 묶여있다면, 둘 다 성공하거나 둘 다 실패해야 한다. 일부만 처리되는 일은 없어야 한다.
- 격리성(Isolation): A 크루의 출석 데이터가 처리되는 도중 B 크루의 처리가 끼어들어 데이터가 꼬이면 안 된다. 각 요청은 독립적으로 격리되어 안전하게 기록되어야 한다.

6. 출석 데이터가 파일(CSV)이 아닌 데이터베이스에 저장되는 이유는 무엇일까? 파일 시스템으로 출석을 관리했다면 어떤 문제가 생길까?
- 출제 의도: 2026 공통강의 - DB에서 배운 파일 시스템의 한계(데이터 중복, 일관성, 동시 접근, 보안)를 출석 시스템이라는 구체적인 사례에 적용해보자.

- 동시 접근 문제: 파일은 한 명이 수정 중일 때 다른 사람이 접근하면 덮어쓰기로 데이터가 날아가거나 대기해야 한다.
- 무결성 문제: 날짜 칸에 한글 이름을 적는 등 잘못된 데이터를 입력해도 시스템이 막을 수 없다.
- 검색 성능: 수만 건의 파일 기록에서 특정인의 기록만 찾으려면 전체를 읽어야 하지만, DB는 인덱스를 통해 순식간에 찾아낸다.

7. 출석 데이터를 관계형 DB가 아닌 NoSQL(예: MongoDB)로 저장한다면 테이블 구조가 어떻게 달라질까? 어떤 장단점이 있을까?
- 출제 의도: 2026 공통강의 - DB에서 배운 RDBMS vs NoSQL 비교를 실제 데이터에 적용해보자. 출석 데이터처럼 구조가 명확한 경우와, 크루 프로필처럼 자유로운 구조가 필요한 경우를 비교해보자.

- 구조 변화: 테이블을 분리하지 않고, 크루 1명의 정보 안에 출석 기록을 배열(Array) 형태로 한꺼번에 담아서 저장한다.
- 장점: 조인(JOIN) 연산 없이 한 번의 조회로 개인의 모든 데이터를 가져올 수 있어 읽기 속도가 빠르다.
- 단점: "특정 날짜에 출석한 모든 사람"을 검색하거나 통계를 낼 때는 관계형 DB보다 필터링 작업이 복잡하고 비효율적이다.

# 더 생각해보기 (심화)
1. 왜 crew 테이블에서 nickname을 기본키로 하지 않은 걸까? attendance 테이블에 attendance_id가 존재하는 이유는 무엇일까?
- 출제 의도: 자연키(nickname)와 대리키(crew_id, attendance_id)의 차이점과 선택 기준을 이해해보자. 업무적 의미가 있는 데이터(nickname)는 미래에 변경될 가능성이 있어 기본키로 적합하지 않을 수 있다.

- 자연키의 한계: 닉네임처럼 현실에서 의미를 가지는 값은 변경될 수 있다. 닉네임이 바뀌면 연관된 수많은 출석 데이터까지 모두 뜯어고쳐야 한다.
- 대리키의 필요성: crew_id 같은 의미 없는 숫자는 변하지 않으므로 기본키로 안전하다. attendance_id 역시 각 출석 기록을 개별적으로 식별하고 관리하기 위해 필요하다.

2. 데이터베이스 제약 조건 중 RESTRICT, CASCADE는 무엇인가?
- 출제 의도: 외래키 관계에서 참조 무결성을 유지하기 위한 다양한 전략을 이해해보자. 예를 들어 사용자가 탈퇴할 때 그 사용자의 게시글도 함께 삭제해야 할지, 아니면 유지해야 할지와 같은 실제 의사결정에 이 개념이 어떻게 적용되는지 고민해보자.

- RESTRICT (제한): 자식 데이터(출석 기록)가 존재하면 부모 데이터(크루)의 삭제를 막는다. 데이터를 함부로 지우지 못하게 보호할 때 쓴다.
- CASCADE (연쇄): 부모 데이터를 지우면 연관된 자식 데이터도 폭포수처럼 일괄 삭제한다. 회원 탈퇴 시 작성 글을 모두 지우는 로직에 사용한다.

3. 다음 두 쿼리는 동일한 결과를 반환하지만 성능에 차이가 있다. 어떤 차이가 있으며, 어떤 상황에서 각각 유리할까?
```
-- 쿼리 1: 서브쿼리 사용
SELECT * FROM attendance WHERE crew_id IN (SELECT crew_id FROM crew WHERE nickname LIKE '네%');

-- 쿼리 2: JOIN 사용
SELECT a.* FROM attendance a JOIN crew c ON a.crew_id = c.crew_id WHERE c.nickname LIKE '네%';
```
- 출제 의도: 동일한 결과를 위한 다양한 접근법의 장단점을 이해하는 것은 실무에서 중요한 의사결정 역량이기도 하다.

- JOIN 유리: 데이터 양이 방대할 때 보통 조인이 유리하다. DB 옵티마이저가 인덱스를 활용해 두 테이블을 매칭하는 데 최적화되어 있다.
- 서브쿼리 유리: 메인 테이블에서 조회할 데이터가 적고, 엮어야 할 조건 테이블의 크기가 작을 때 쿼리를 직관적으로 작성하기 좋다.

4. attendance 테이블을 완전히 정규화하면 어떤 장점이 있을까? 반대로 일부 비정규화를 적용한다면 어떤 쿼리 성능 이점을 얻을 수 있을까?
- 출제 의도: 정규화와 성능 사이의 균형은 데이터베이스 설계의 핵심 과제이다.

- 정규화 장점: 데이터를 분리해 중복을 없애므로, 수정 시 한 곳만 업데이트하면 되어 데이터의 일관성이 완벽하게 보장된다.
- 비정규화 이점: 조회를 할 때마다 무거운 JOIN 연산을 할 필요 없이 테이블 하나만 읽어 빠르게 결과를 가져올 수 있다. 쓰기를 희생하고 읽기 성능을 극대화하는 전략이다.

5. 출석 시스템이 수백 명의 사용자에 의해 동시에 접근된다면, 연결 풀링(connection pooling)은 무엇이고 왜 필요한가?
- 출제 의도: 데이터베이스 연결 관리는 웹 애플리케이션 성능에 큰 영향을 미치는 요소이다.

- 개념: 미리 DB와 연결된 통로(Connection)를 일정 개수 만들어 두고, 사용자가 요청할 때마다 빌려주고 반납받는 방식이다.
- 필요성: 접속할 때마다 새로 연결을 맺는 과정은 서버에 큰 부하를 준다. 풀링을 쓰면 연결 생성 비용을 아끼고 트래픽 폭주로 인한 서버 다운을 막을 수 있다.

6. 실습에서 수행한 INSERT, UPDATE, DELETE를 하나의 트랜잭션으로 묶는다면 어떻게 작성할 수 있을까? 만약 DELETE 도중 오류가 발생하면 앞서 수행한 INSERT와 UPDATE는 어떻게 되어야 할까?
- 출제 의도: 2026 공통강의 - DB에서 배운 트랜잭션의 Commit/Rollback 개념을 실습 문제와 직접 연결해보자.

- 작성법: START TRANSACTION;으로 묶음 작업을 시작하고, 모든 작업이 성공하면 마지막에 COMMIT;을 통해 영구 저장한다.
- 롤백(Rollback): DELETE 도중 오류가 발생하면 ROLLBACK;을 호출한다. 이전 단계에서 수행했던 INSERT와 UPDATE 작업은 모두 취소되며, DB는 트랜잭션 시작 전 상태로 원상 복구된다.
