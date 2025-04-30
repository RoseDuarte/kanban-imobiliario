const registerBtn = document.getElementById('register-btn');
if(registerBtn) {
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if(!name || !email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos obrigatórios',
                text: 'Por favor, preencha todos os campos.',
                confirmButtonColor: '#273E68'
              });
            return;
        }

        const user = {
            name, 
            email,
            password
        };

        localStorage.setItem('user', JSON.stringify(user));
        
        Swal.fire({
            icon: 'success',
            title: 'Cadastro realizado!',
            text: 'Você será redirecionado para o login.',
            confirmButtonColor: '#273E68'
          }).then(() => {
            window.location.href = "login.html";
          });
    });
}

const loginBtn = document.getElementById('login-btn');
if(loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if(!email || !password) {
          Swal.fire({
            icon: 'warning',
            title: 'Campos obrigatórios',
            text: 'Por favor, preencha o e-mail e a senha.',
            confirmButtonColor: '#273E68'
          });
          return;
        }

        const storedUser = JSON.parse(localStorage.getItem('user'));

        if(!storedUser) {
            Swal.fire({
                icon: 'info',
                title: 'Nenhum usuário encontrado',
                text: 'Por favor, faça o cadastro antes de fazer login.',
                confirmButtonColor: '#273E68'
              });
            return;
        }

        if(storedUser.email === email && storedUser.password === password) {
            localStorage.setItem('loggedIn', 'true');
            Swal.fire({
                icon: 'success',
                title: 'Login realizado!',
                text: 'Você será redirecionado...',
                confirmButtonColor: '#273E68'
              }).then(() => {
                window.location.href = 'index.html';
              });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'E-mail ou senha incorretos!',
                confirmButtonColor: '#d11a2a'
              });
        }
    });
}