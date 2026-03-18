// TODO: TIL 폼 등록 기능을 구현하세요
// 1. 폼 요소와 목록 요소를 querySelector로 선택합니다.
const tilForm = document.querySelector('#til-form');
const tilList = document.querySelector('#til-list');

// 2. 폼의 submit 이벤트를 감지하여 새 TIL 항목을 목록에 추가합니다.
tilForm.addEventListener('submit', function (event) {
  event.preventDefault();

  // TODO: 입력값을 가져와서 새 TIL 항목을 만들어 목록에 추가하세요
  // 3. 입력된 값 가져오기
  const dateValue = document.querySelector('#til-date').value;
  const titleValue = document.querySelector('#til-title').value;
  const contentValue = document.querySelector('#til-content').value;

  // 4. 새로운 TIL 태그 생성 및 클래스 추가
  const newArticle = document.createElement('article');
  newArticle.classList.add('til-item');

  // 5. 생성한 article 내부에 들어갈 HTML 구조 만들기
  newArticle.innerHTML = `
    <time>${dateValue}</time>
    <h3>${titleValue}</h3>
    <p>${contentValue}</p>
  `;

  // 6. 완성된 새 항목을 TIL 목록의 맨 위에 추가
  tilList.prepend(newArticle);

  // 7. 입력 폼 초기화
  tilForm.reset();
});
