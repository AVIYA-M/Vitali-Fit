const API_URL = 'http://localhost:5000/api';


// ==============================
// התחברות
// ==============================
async function handleAuth(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showCustomMessageBox(
                `שגיאה בהתחברות: ${data.message || 'פרטים שגויים'}`
            );
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showCustomMessageBox(
            `התחברת בהצלחה למערכת!\nברוך הבא, ${data.user.fullName}`
        );

        const params = new URLSearchParams(window.location.search);
        const redirectPage = params.get('redirect') || 'index.html';

        setTimeout(() => {
            window.location.href = redirectPage;
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);

        showCustomMessageBox(
            'שגיאת תקשורת עם השרת. ודאי שהשרת פועל.'
        );
    }
}


// ==============================
// הרשמה
// ==============================
async function handleRegister(event) {

    event.preventDefault();

    const form = event.currentTarget;

    const fullName =
        form.querySelector(
            'input[name="fullName"]'
        ).value.trim();

    const email =
        form.querySelector(
            'input[name="email"]'
        ).value.trim();

    const password =
        form.querySelector(
            'input[name="password"]'
        ).value;

    const weight =
        form.querySelector(
            'input[name="weight"]'
        ).value;

    const weighInDay =
        form.querySelector(
            'select[name="weighInDay"]'
        ).value;


    try {

        const response =
            await fetch(
                `${API_URL}/auth/register`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({

                        fullName,

                        email,

                        password,

                        weight,

                        weighInDay

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showCustomMessageBox(

                `שגיאה בהרשמה: ${
                    data.message ||
                    'לא ניתן ליצור את החשבון'
                }`

            );

            return;

        }


        showCustomMessageBox(
            'החשבון נוצר בהצלחה!\nמעבירה אותך לדף ההתחברות...'
        );


        setTimeout(() => {

            window.location.href =
                'login.html';

        }, 1200);


    } catch (error) {

        console.error(
            'Register error:',
            error
        );


        showCustomMessageBox(
            'שגיאת תקשורת עם השרת. ודאי שהשרת פועל.'
        );

    }

}