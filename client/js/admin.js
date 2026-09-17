let usersData = [
    { id: 1, name: 'ישראל ישראלי', email: 'israel@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'שרה כהן', email: 'sarah@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'דוד לוי', email: 'david@example.com', role: 'User', status: 'Inactive' },
    { id: 4, name: 'מיכל אברהמי', email: 'michal@example.com', role: 'User', status: 'Active' }
];


// ניהול טבלת משתמשים (פאנל ניהול)
function renderUsersTable(data) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-gray-500 text-xs">לא נמצאו משתמשים תואמים.</td></tr>`;
        return;
    }

    data.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 transition-colors";
        tr.innerHTML = `
            <td class="py-3.5 px-6 font-semibold text-gray-900 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[#E8F5F1] border border-[#A3D9C9] flex items-center justify-center text-[#1E4630] text-xs font-bold">
                    ${user.name.charAt(0)}
                </div>
                <span>${user.name}</span>
            </td>
            <td class="py-3.5 px-6 text-gray-600">${user.email}</td>
            <td class="py-3.5 px-6">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${user.role === 'Admin' ? 'bg-[#E8F5F1] text-[#1E4630] border border-[#A3D9C9]' : 'bg-gray-100 text-gray-700 border border-gray-200'}">
                    ${user.role}
                </span>
            </td>
            <td class="py-3.5 px-6">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${user.status === 'Active' ? 'bg-[#E8F5F1] text-[#1E4630] border border-[#A3D9C9]' : 'bg-rose-50 text-rose-600 border border-rose-200'}">
                    <span class="w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-[#1E4630]' : 'bg-rose-500'}"></span>
                    ${user.status}
                </span>
            </td>
            <td class="py-3.5 px-6 text-center">
                <div class="flex items-center justify-center gap-1.5">
                    <button onclick="viewUserProfile('${user.name}', '${user.email}', '${user.role}')" title="צפייה" class="p-1.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 transition-all"><i class="fa-regular fa-eye text-xs"></i></button>
                    <button onclick="editUserPrompt(${user.id})" title="עריכה" class="p-1.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 text-[#1E4630] transition-all"><i class="fa-regular fa-pen-to-square text-xs"></i></button>
                    <button onclick="deleteUser(${user.id})" title="מחיקה" class="p-1.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-rose-100 text-rose-600 transition-all"><i class="fa-regular fa-trash-can text-xs"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


function filterUsers() {
    const searchInput = document.getElementById('user-search');
    const roleFilter = document.getElementById('role-filter');
    const statusFilter = document.getElementById('status-filter');

    if (!searchInput || !roleFilter || !statusFilter) return;

    const query = searchInput.value.toLowerCase();
    const role = roleFilter.value;
    const status = statusFilter.value;

    const filtered = usersData.filter(u => {
        const matchQuery = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
        const matchRole = role === 'all' || u.role === role;
        const matchStatus = status === 'all' || u.status === status;
        return matchQuery && matchRole && matchStatus;
    });

    renderUsersTable(filtered);
}


function deleteUser(id) {
    usersData = usersData.filter(u => u.id !== id);
    filterUsers();
    showCustomMessageBox("המשתמש הוסר בהצלחה מהמערכת.");
}

function viewUserProfile(name, email, role) {
    showCustomMessageBox(`פרטי פרופיל משתמש:\nשם: ${name}\nאימייל: ${email}\nתפקיד: ${role}\nסטטוס: פעיל`);
}

function editUserPrompt(id) {
    const user = usersData.find(u => u.id === id);
    if (user) {
        const newName = prompt("ערוך שם משתמש:", user.name);
        if (newName) {
            user.name = newName;
            filterUsers();
            showCustomMessageBox("פרטי המשתמש עודכנו בהצלחה!");
        }
    }
}

function openAddUserModal() {
    const name = prompt("הכנס שם מלא למשתמש החדש:");
    if (!name) return;
    const email = prompt("הכנס כתובת אימייל:");
    if (!email) return;

    usersData.push({ id: Date.now(), name: name, email: email, role: 'User', status: 'Active' });
    filterUsers();
    showCustomMessageBox("המשתמש נוסף בהצלחה!");
}