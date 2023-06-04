//-------------------------------------------
//클릭해서 사진 파일 추가하기
function triggerFileInput() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
  }
  
  //프로필 사진 변경하기
  function changeProfileImage() {
    const fileInput = document.getElementById('fileInput');
    const profileImage = document.getElementById('profileImage');
  
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        profileImage.src = e.target.result;
      }
      reader.readAsDataURL(fileInput.files[0]);
    }
  }
  
  //프로필 닉네임
  function changeProfileName() {
    const nameInput = document.getElementById('nameInput');
    const profileName = document.getElementById('profileName');
    const saveProfileButton = document.getElementById('saveProfile');
  
    if (nameInput.value) {
      profileName.textContent = nameInput.value;
      saveProfileButton.disabled = false;
    } else {
      profileName.textContent = '닉네임';
      saveProfileButton.disabled = true;
    }
  }
  
  //프로필 폼 닫기
  function toggleModal(id) {
    document.getElementById(id).classList.toggle('on');
  }
  
  // 프로필 저장 처리
  function saveProfile() {
    const nameInput = document.getElementById('nameInput').value;
    const passwordInput = document.getElementById('passwordInput').value;
    
    console.log('프로필 저장:', nameInput, passwordInput);
    
    // 프로필 폼 닫기
    toggleModal();
  }
  
  //비밀번호 확인 검사
  function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const passwordWarning = document.getElementById('passwordWarning');
    const saveProfileButton = document.getElementById('saveProfile');
  
    if (passwordInput.value !== confirmPasswordInput.value) {
      passwordWarning.textContent = '비밀번호가 일치하지 않습니다.';
      saveProfileButton.disabled = true;
    } else {
      passwordWarning.textContent = '';
      saveProfileButton.disabled = false;
    }
  }