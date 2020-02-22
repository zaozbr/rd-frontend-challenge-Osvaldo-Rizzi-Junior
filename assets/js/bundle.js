(() => {
    const selector = selector => document.querySelector(selector);
    const create = element => document.createElement(element);
    const app = selector('#app');

    const Login = create('div');
    Login.classList.add('login');

    const Logo = create('img');
    Logo.src = './assets/images/logo.svg';
    Logo.classList.add('logo');

    const Form = create('form');

    Form.onsubmit = async e => {
        e.preventDefault();

        const [email, password] = e.target.elements;

        await fakeAuthenticate(email.value, password.value)
            .then(async url => {
                location.href = '#users';
                const users = await getDevelopersList(url);
                renderPageUsers(users);
            });
    };

    Form.oninput = e => {
        const [email, password, button] = e.target.parentElement.children;

        (!email.validity.valid || !email.value || password.value.length <= 5) ?
        button.setAttribute('disabled', 'disabled'): button.removeAttribute('disabled');
    };

    Form.innerHTML = `
        <div id="loginContainer">
            <input id="email" type="email" placeholder="Entre com o seu e-mail"/>
            <input id="password" type="password" placeholder="Digite sua senha supersecreta"/>
            <button type="submit" disabled="disabled">Entrar</button>
        </div>`;

    app.classList.remove("logged");
    app.appendChild(Logo);
    Login.appendChild(Form);

    async function fakeAuthenticate(email, password) {
        try {
            const responseAuth = await fetch('http://www.mocky.io/v2/5dba690e3000008c00028eb6?email=${email}&password=${password}', {
                    method: 'POST'
                })
                .then(async response => {
                    return response.json()
                });
            const fakeJwtToken = `${btoa(email+password)}.${btoa(responseAuth.url)}.${(new Date()).getTime()+300000}`;
            localStorage.setItem("fakeJwtToken", fakeJwtToken);

            return await responseAuth.url;

        } catch (err) {
            console.error("ERRO!!!", err);
            alert("Houve um problema ao autenticar, por favor tente novamente mais tarde!");
            reject(err);
        };
    };

    async function getDevelopersList(urlDev) {
        try {
            const response = await fetch(urlDev)
                .then(async response => {
                    return response.json()
                });
            console.log('response', response);
            return new Promise(resolve => {
                resolve(response);
            });
        } catch (err) {
            console.error("ERRO!!!", err);
            alert("Houve um problema ao adquirir a lista de desenvolvedores, por favor tente novamente mais tarde!");
            return;
        };
    };

    function renderPageUsers(users) {
        Login.style.display = 'none';

        const Ul = create('ul');
        Ul.classList.add('container');

        users.forEach((content, index) => {
            var el;
            el = document.createElement('li');
            el.innerHTML = `
            <a target='_blank' href='${content.url}'>
                <img src='${content.avatar_url}' alt='${content.login}'/>
                <span>${content.login}</span>
            </a>`;
            Ul.appendChild(el);
        });

        app.classList.add("logged");
        app.appendChild(Ul);
    }

    // init
    (async function () {
        const rawToken = localStorage.getItem('fakeJwtToken');
        const token = rawToken ? rawToken.split('.') : null;
        if (!token || token[2] < (new Date()).getTime()) {
            localStorage.removeItem('token');
            location.href = '#login';
            app.classList.remove('logged');
            app.appendChild(Login);
        } else {
            location.href = '#users';
            const users = await getDevelopersList(atob(token[1]));
            renderPageUsers(users);
        }
    })();
})();