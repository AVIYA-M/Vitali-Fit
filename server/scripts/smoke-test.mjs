const BASE = 'https://vitali-fit.onrender.com';
const stamp = Date.now();
const email = `smoke-${stamp}@example.com`;
const password = 'Test1234';

let passed = 0;
let failed = 0;

async function call(method, path, { token, body } = {}) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    });

    let data = null;
    try { data = await res.json(); } catch { /* לא JSON */ }
    return { status: res.status, data };
}

function check(name, condition, details = '') {
    if (condition) {
        passed++;
        console.log(`  ✅ ${name}`);
    } else {
        failed++;
        console.log(`  ❌ ${name} ${details}`);
    }
}

const section = (title) => console.log(`\n▶ ${title}`);

async function run() {
    section('שרת');
    const status = await call('GET', '/api/status');
    check('GET /api/status מחזיר 200', status.status === 200, `(קיבלתי ${status.status})`);

    const unknown = await call('GET', '/api/does-not-exist');
    check('נתיב לא קיים מחזיר 404 בפורמט JSON', unknown.status === 404 && !!unknown.data?.message);

    section('הרשמה והתחברות');
    const badReg = await call('POST', '/api/auth/register', { body: { fullName: 'א', email: 'not-an-email', password: '1' } });
    check('הרשמה עם נתונים לא תקינים נדחית (400)', badReg.status === 400, `(קיבלתי ${badReg.status})`);

    const emptyReg = await call('POST', '/api/auth/register', {});
    check('הרשמה בלי גוף בכלל נדחית (400)', emptyReg.status === 400, `(קיבלתי ${emptyReg.status})`);

    const reg = await call('POST', '/api/auth/register', { body: { fullName: 'בדיקה אוטומטית', email, password } });
    check('הרשמה תקינה (201) ומחזירה טוקן', reg.status === 201 && !!reg.data?.token, `(קיבלתי ${reg.status})`);
    check('התשובה לא כוללת סיסמה', !JSON.stringify(reg.data || {}).includes('password'));

    const dup = await call('POST', '/api/auth/register', { body: { fullName: 'בדיקה אוטומטית', email, password } });
    check('הרשמה כפולה נדחית (400)', dup.status === 400);

    const wrongPass = await call('POST', '/api/auth/login', { body: { email, password: 'wrong-password' } });
    check('התחברות עם סיסמה שגויה נדחית (400)', wrongPass.status === 400);

    const login = await call('POST', '/api/auth/login', { body: { email, password } });
    check('התחברות תקינה (200)', login.status === 200 && !!login.data?.token);
    const token = login.data?.token;

    const noToken = await call('GET', '/api/auth/profile');
    check('פרופיל בלי טוקן נדחה (401)', noToken.status === 401);
    const profile = await call('GET', '/api/auth/profile', { token });
    check('פרופיל עם טוקן (200)', profile.status === 200);

    section('משקל');
    const badWeight = await call('POST', '/api/weight', { token, body: { weight: 0.5 } });
    check('משקל קטן מדי נדחה (400, לא קריסה 500)', badWeight.status === 400, `(קיבלתי ${badWeight.status})`);

    const w1 = await call('POST', '/api/weight', { token, body: { weight: 70 } });
    check('שקילה ראשונה (201)', w1.status === 201, `(קיבלתי ${w1.status})`);
    check('בשקילה ראשונה המשקל ההתחלתי הוא 70 וההפרש 0', w1.data?.initialWeight === 70 && w1.data?.weightChange === 0 && w1.data?.previousWeightDiff === 0);

    const w2 = await call('POST', '/api/weight', { token, body: { weight: 69 } });
    check('שקילה שנייה: ירידה של 1- מהקודמת ומההתחלה', w2.data?.previousWeightDiff === -1 && w2.data?.weightChange === -1, JSON.stringify(w2.data));

    const hist = await call('GET', '/api/weight/history', { token });
    check('בהיסטוריה בדיוק 2 שקילות (בלי רשומה כפולה)', Array.isArray(hist.data) && hist.data.length === 2, `(יש ${hist.data?.length})`);

    section('פעילות');
    const badAct = await call('POST', '/api/activities', { token, body: { activityType: 'flying', durationMinutes: 30 } });
    check('סוג פעילות לא קיים נדחה (400)', badAct.status === 400);

    const act = await call('POST', '/api/activities', { token, body: { activityType: 'walking', durationMinutes: 30 } });
    check('הוספת פעילות (201) עם קלוריות מחושבות', act.status === 201 && act.data?.activity?.caloriesBurned > 0, `(קיבלתי ${act.status})`);

    section('לוח מעקב');
    const dash = await call('GET', '/api/tracking', { token });
    check('לוח המעקב נטען (200)', dash.status === 200);
    check('המשקל בלוח הוא 69 וההפרש מההתחלה 1-', dash.data?.weight === 69 && dash.data?.weightChange === -1, JSON.stringify({ w: dash.data?.weight, c: dash.data?.weightChange }));
    check('הפעילות נספרה בלוח', dash.data?.weeklyActivities >= 1);

    const badTrack = await call('POST', '/api/tracking/not-an-id/complete', { token });
    check('מזהה אימון לא תקין נדחה (400)', badTrack.status === 400);

    section('אימונים - הרשאות וחיפוש');
    const workouts = await call('GET', '/api/workouts');
    check('רשימת אימונים פתוחה לכולם (200)', workouts.status === 200 && Array.isArray(workouts.data));

    const search = await call('GET', '/api/workouts?search=' + encodeURIComponent('(.*'));
    check('חיפוש עם תווים מיוחדים לא קורס (200)', search.status === 200, `(קיבלתי ${search.status})`);

    const userCreate = await call('POST', '/api/workouts', { token, body: {} });
    check('משתמש רגיל לא יכול ליצור אימון (403)', userCreate.status === 403);

    const badReg2 = await call('POST', '/api/workouts/123/register', { token });
    check('הרשמה לאימון עם מזהה לא תקין נדחית (400)', badReg2.status === 400);

    section('המלצות');
    const badReview = await call('POST', '/api/reviews', { token, body: { text: '' } });
    check('המלצה ריקה נדחית (400)', badReview.status === 400);

    const review = await call('POST', '/api/reviews', { token, body: { text: 'בדיקה אוטומטית - אפשר למחוק', isAnonymous: true } });
    check('המלצה תקינה נקלטת כממתינה (201)', review.status === 201 && review.data?.review?.status === 'pending');

    const approved = await call('GET', '/api/reviews/approved');
    check('המלצות מאושרות פתוחות לכולם (200)', approved.status === 200);

    const adminReviews = await call('GET', '/api/reviews/admin/all', { token });
    check('משתמש רגיל לא רואה המלצות ניהול (403)', adminReviews.status === 403);

    section('צור קשר');
    const badContact = await call('POST', '/api/contact', { body: { name: 'א', email: 'x', subject: '', message: '1' } });
    check('פנייה לא תקינה נדחית (400)', badContact.status === 400);

    const contact = await call('POST', '/api/contact', { body: { name: 'בדיקה', email, subject: 'בדיקה אוטומטית', message: 'זו הודעת בדיקה, אפשר למחוק' } });
    check('פנייה תקינה נשמרת (201)', contact.status === 201);

    section('הרשאות מנהל');
    const adminUsers = await call('GET', '/api/admin/users', { token });
    check('משתמש רגיל לא רואה רשימת משתמשים (403)', adminUsers.status === 403);

    const selfRole = await call('PATCH', `/api/admin/users/${login.data?.user?.id}/role`, { token, body: { role: 'admin' } });
    check('משתמש רגיל לא יכול להפוך את עצמו למנהל (403)', selfRole.status === 403);

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        section('מנהל (ADMIN_EMAIL הוגדר)');
        const adminLogin = await call('POST', '/api/auth/login', { body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } });
        const adminToken = adminLogin.data?.token;
        check('התחברות מנהל', adminLogin.status === 200 && adminLogin.data?.user?.role === 'admin');

        if (adminToken) {
            const list = await call('GET', '/api/admin/users', { token: adminToken });
            check('מנהל רואה משתמשים (200) בלי סיסמאות', list.status === 200 && !JSON.stringify(list.data).includes('"password"'));

            const oldRoute = await call('GET', '/api/auth/admin/users', { token: adminToken });
            check('הנתיב הישן /api/auth/admin/users עדיין עובד', oldRoute.status === 200);

            const badRole = await call('PATCH', `/api/admin/users/${login.data.user.id}/role`, { token: adminToken, body: { role: 'superman' } });
            check('תפקיד לא חוקי נדחה (400)', badRole.status === 400, `(קיבלתי ${badRole.status})`);

            const badWorkout = await call('POST', '/api/workouts', { token: adminToken, body: { title: 'x' } });
            check('אימון חסר שדות נדחה (400)', badWorkout.status === 400);

            const date = new Date(Date.now() + 3 * 86400000).toISOString();
            const created = await call('POST', '/api/workouts', {
                token: adminToken,
                body: {
                    title: 'בדיקה אוטומטית', description: 'אימון בדיקה - נמחק בסוף', date, time: '18:00',
                    instructor: 'מדריכה', maxParticipants: 5, durationMinutes: 45, estimatedCalories: 300
                }
            });
            check('מנהל יוצר אימון (201)', created.status === 201, `(קיבלתי ${created.status} ${JSON.stringify(created.data)})`);
            const wid = created.data?.workout?._id;

            if (wid) {
                const reg1 = await call('POST', `/api/workouts/${wid}/register`, { token });
                check('משתמש נרשם לאימון (200)', reg1.status === 200);

                const reg2 = await call('POST', `/api/workouts/${wid}/register`, { token });
                check('הרשמה כפולה נדחית (400)', reg2.status === 400);

                const done = await call('POST', `/api/tracking/${wid}/complete`, { token });
                check('סימון אימון כהושלם (201)', done.status === 201);

                const done2 = await call('POST', `/api/tracking/${wid}/complete`, { token });
                check('סימון כפול נדחה (400)', done2.status === 400);

                const del = await call('DELETE', `/api/workouts/${wid}`, { token: adminToken });
                check('מחיקת אימון (200)', del.status === 200);

                const dash2 = await call('GET', '/api/tracking', { token });
                check('היסטוריית המעקב נשמרה אחרי מחיקת האימון', dash2.status === 200 && dash2.data?.history?.length >= 1);
            }
        }
    } else {
        console.log('\nℹ️  לא הוגדר ADMIN_EMAIL, לכן דולגתי על בדיקות המנהל (יצירת אימון, הרשמה, סימון כהושלם).');
    }

    console.log(`\n==============================\nעברו: ${passed}   נכשלו: ${failed}\n==============================`);
    process.exit(failed ? 1 : 0);
}

run().catch((err) => {
    console.error('\n❌ הבדיקה נעצרה. האם השרת דלוק?', err.message);
    process.exit(1);
});
