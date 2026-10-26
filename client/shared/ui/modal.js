let messageModal;
let currentOnClose;

function ensureMessageModal() {
    if (messageModal?.isConnected) return messageModal;

    const overlay = document.createElement('div');
    overlay.id = 'shared-message-modal';
    overlay.className = 'modal-overlay hidden';
    overlay.setAttribute('role', 'presentation');

    const box = document.createElement('section');
    box.className = 'modal-box';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'shared-message-title');

    const iconWrap = document.createElement('div');
    iconWrap.className = 'modal-icon';
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-check';
    iconWrap.append(icon);

    const title = document.createElement('h3');
    title.id = 'shared-message-title';
    title.className = 'modal-title';
    title.textContent = 'הודעת מערכת';

    const message = document.createElement('p');
    message.className = 'modal-message';

    const buttons = document.createElement('div');
    buttons.className = 'modal-actions';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'modal-button';
    closeButton.textContent = 'אישור';

    closeButton.addEventListener('click', closeMessage);
    overlay.addEventListener('click', event => {
        if (event.target === overlay) closeMessage();
    });
    box.append(iconWrap, title, message, buttons);
    buttons.append(closeButton);
    overlay.append(box);
    document.body.append(overlay);
    messageModal = overlay;
    return overlay;
}

function closeMessage() {
    if (!messageModal) return;
    const callback = currentOnClose;
    currentOnClose = undefined;
    messageModal.classList.add('hidden');
    messageModal.querySelector('.modal-box')?.classList.remove('modal-visible');
    callback?.();
}

export function showMessage(message, { title = 'הודעת מערכת', onClose } = {}) {
    const overlay = ensureMessageModal();
    overlay.querySelector('.modal-title').textContent = title;
    overlay.querySelector('.modal-message').textContent = message;
    const buttons = overlay.querySelector('.modal-actions');
    buttons.replaceChildren();

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'modal-button';
    button.textContent = 'אישור';
    button.addEventListener('click', closeMessage);
    buttons.append(button);

    currentOnClose = onClose;
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-visible'));
}

export function confirmMessage(message, { title = 'אישור פעולה' } = {}) {
    const overlay = ensureMessageModal();
    overlay.querySelector('.modal-title').textContent = title;
    overlay.querySelector('.modal-message').textContent = message;
    const buttons = overlay.querySelector('.modal-actions');
    buttons.replaceChildren();

    return new Promise(resolve => {
        currentOnClose = () => resolve(false);

        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'modal-button modal-button-secondary';
        cancelButton.textContent = 'ביטול';
        cancelButton.addEventListener('click', closeMessage);

        const confirmButton = document.createElement('button');
        confirmButton.type = 'button';
        confirmButton.className = 'modal-button';
        confirmButton.textContent = 'אישור';
        confirmButton.addEventListener('click', () => {
            currentOnClose = () => resolve(true);
            closeMessage();
        });

        buttons.append(cancelButton, confirmButton);
        overlay.classList.remove('hidden');
        requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-visible'));
    });
}

export function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.querySelector('.modal-box')?.classList.add('modal-visible');
    modal.setAttribute('aria-hidden', 'false');
}

export function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.querySelector('.modal-box')?.classList.remove('modal-visible');
    modal.setAttribute('aria-hidden', 'true');
}
