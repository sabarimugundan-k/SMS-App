/**
 * CampusHub — Student Directory v2.0
 * Features: skeleton loading, live search, modal confirm,
 *           inline validation, delegated events, loading states
 */

const BASE_URL = 'http://localhost:8080/api/v1/students';

// ── DOM references ─────────────────────────────────────────
const form        = document.getElementById('student-form');
const nameInput   = document.getElementById('name');
const emailInput  = document.getElementById('email');
const idInput     = document.getElementById('student-id');
const studentList = document.getElementById('student-list');
const countEl     = document.getElementById('student-count');
const submitBtn   = document.getElementById('submit-btn');
const cancelBtn   = document.getElementById('cancel-btn');
const formTitle   = document.getElementById('form-title');
const formSub     = document.getElementById('form-subtitle');
const toast       = document.getElementById('toast');
const searchInput = document.getElementById('search-input');
const emptyState  = document.getElementById('empty-state');
const emptyMsg    = document.getElementById('empty-message');
const modalBack   = document.getElementById('modal-backdrop');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm= document.getElementById('modal-confirm');

// ── App state ──────────────────────────────────────────────
let allStudents   = [];   // master list from API
let pendingDelete = null; // id queued for deletion
let toastTimer    = null;

// ── Bootstrap ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSkeletons(5);
  fetchStudents();
  searchInput.addEventListener('input', debounce(handleSearch, 240));
  form.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', resetForm);
  studentList.addEventListener('click', handleTableClick);
  modalCancel.addEventListener('click', closeModal);
  modalBack.addEventListener('click', e => { if (e.target === modalBack) closeModal(); });
  modalConfirm.addEventListener('click', confirmDelete);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

// ── Fetch all students ─────────────────────────────────────
async function fetchStudents() {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    allStudents = await res.json();
    renderStudents(allStudents);
  } catch (err) {
    console.error(err);
    showTableError('Could not reach the server. Is the Spring Boot backend running?');
  }
}

// ── Handle form submit (create / update) ───────────────────
async function handleSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const data = {
    name:  nameInput.value.trim(),
    email: emailInput.value.trim()
  };
  const targetId = idInput.value;

  setSubmitLoading(true);

  try {
    if (targetId) {
      await updateStudent(targetId, data);
      showToast('Student updated successfully!', 'success');
    } else {
      await createStudent(data);
      showToast('Student added successfully!', 'success');
    }
    resetForm();
    await fetchStudents();
  } catch (err) {
    showToast(err.message || 'Something went wrong.', 'error');
  } finally {
    setSubmitLoading(false);
  }
}

// ── Delegated click handler for Edit / Delete buttons ──────
function handleTableClick(e) {
  const editBtn = e.target.closest('.btn-edit');
  const delBtn  = e.target.closest('.btn-del');

  if (editBtn) {
    const id    = editBtn.dataset.id;
    const student = allStudents.find(s => String(s.id) === String(id));
    if (student) populateEditForm(student);
  }

  if (delBtn) {
    pendingDelete = delBtn.dataset.id;
    const student = allStudents.find(s => String(s.id) === String(pendingDelete));
    const name = student ? escapeHTML(student.name) : 'this student';
    document.getElementById('modal-body').textContent =
      `"${name}" will be permanently removed. This action cannot be undone.`;
    openModal();
  }
}

// ── Create ─────────────────────────────────────────────────
async function createStudent(data) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create student.');
  }
}

// ── Update ─────────────────────────────────────────────────
async function updateStudent(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update student.');
  }
}

// ── Delete (called from modal confirm) ─────────────────────
async function confirmDelete() {
  if (!pendingDelete) return;
  setModalLoading(true);

  try {
    const res = await fetch(`${BASE_URL}/${pendingDelete}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete student.');
    showToast('Student removed.', 'success');
    pendingDelete = null;
    closeModal();
    await fetchStudents();
  } catch (err) {
    showToast(err.message, 'error');
    closeModal();
  } finally {
    setModalLoading(false);
  }
}

// ── Render table rows ──────────────────────────────────────
function renderStudents(students) {
  emptyState.classList.add('hidden');
  studentList.innerHTML = '';

  // Update count
  countEl.textContent = students.length;

  if (students.length === 0) {
    const isFiltering = searchInput.value.trim() !== '';
    emptyMsg.textContent = isFiltering
      ? 'No students match your search.'
      : 'Add your first student using the form on the left.';
    emptyState.classList.remove('hidden');
    return;
  }

  const frag = document.createDocumentFragment();

  students.forEach((student, i) => {
    const tr = document.createElement('tr');
    tr.style.animationDelay = `${i * 40}ms`;
    tr.innerHTML = `
      <td class="td-index">${i + 1}</td>
      <td>
        <div class="student-name">${escapeHTML(student.name)}</div>
      </td>
      <td>
        <div class="student-email">${escapeHTML(student.email)}</div>
      </td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-edit" data-id="${student.id}" aria-label="Edit ${escapeHTML(student.name)}">Edit</button>
          <button class="btn btn-sm btn-del"  data-id="${student.id}" aria-label="Delete ${escapeHTML(student.name)}">Delete</button>
        </div>
      </td>
    `;
    frag.appendChild(tr);
  });

  studentList.appendChild(frag);
}

// ── Skeleton loader rows ───────────────────────────────────
function renderSkeletons(count) {
  studentList.innerHTML = Array.from({ length: count }, (_, i) => `
    <tr style="animation-delay:${i * 60}ms">
      <td class="td-index"><span class="skeleton" style="width:18px"></span></td>
      <td><span class="skeleton" style="width:${100 + (i % 3) * 40}px"></span></td>
      <td><span class="skeleton" style="width:${130 + (i % 2) * 50}px"></span></td>
      <td>
        <div class="td-actions">
          <span class="skeleton" style="width:44px;height:28px;border-radius:8px"></span>
          <span class="skeleton" style="width:52px;height:28px;border-radius:8px"></span>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Table error state ──────────────────────────────────────
function showTableError(msg) {
  studentList.innerHTML = `
    <tr>
      <td colspan="4" style="padding:3rem;text-align:center;color:var(--danger);font-size:0.9rem;">
        ⚠ ${escapeHTML(msg)}
      </td>
    </tr>
  `;
  countEl.textContent = '—';
}

// ── Populate form for editing ──────────────────────────────
function populateEditForm(student) {
  idInput.value    = student.id;
  nameInput.value  = student.name;
  emailInput.value = student.email;
  formTitle.textContent = 'Edit Student';
  formSub.textContent   = 'Update the details and save.';
  submitBtn.querySelector('.btn-text').textContent = 'Apply Changes';
  cancelBtn.classList.remove('hidden');
  clearErrors();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  nameInput.focus();
}

// ── Reset form ─────────────────────────────────────────────
function resetForm() {
  form.reset();
  idInput.value = '';
  formTitle.textContent = 'New Student';
  formSub.textContent   = 'Fill in the details below';
  submitBtn.querySelector('.btn-text').textContent = 'Save Student';
  cancelBtn.classList.add('hidden');
  clearErrors();
}

// ── Live search / filter ───────────────────────────────────
function handleSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    renderStudents(allStudents);
    return;
  }
  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q)
  );
  renderStudents(filtered);
}

// ── Inline validation ──────────────────────────────────────
function validateForm() {
  let valid = true;
  clearErrors();

  const name  = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name) {
    showFieldError('name-error', 'Full name is required.');
    nameInput.focus();
    valid = false;
  } else if (name.length < 2) {
    showFieldError('name-error', 'Name must be at least 2 characters.');
    valid = false;
  }

  if (!email) {
    showFieldError('email-error', 'Email address is required.');
    if (valid) emailInput.focus();
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('email-error', 'Enter a valid email address.');
    if (valid) emailInput.focus();
    valid = false;
  }

  return valid;
}

function showFieldError(id, msg) {
  document.getElementById(id).textContent = msg;
}

function clearErrors() {
  document.getElementById('name-error').textContent  = '';
  document.getElementById('email-error').textContent = '';
}

// ── Toast notification ─────────────────────────────────────
function showToast(msg, type) {
  clearTimeout(toastTimer);
  toast.textContent = type === 'success' ? `✓ ${msg}` : `✕ ${msg}`;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 4000);
}

// ── Submit button loading state ────────────────────────────
function setSubmitLoading(loading) {
  const text    = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.btn-spinner');
  submitBtn.disabled = loading;
  text.classList.toggle('hidden', loading);
  spinner.classList.toggle('hidden', !loading);
}

// ── Modal helpers ──────────────────────────────────────────
function openModal()  { modalBack.classList.remove('hidden'); }
function closeModal() {
  modalBack.classList.add('hidden');
  pendingDelete = null;
  setModalLoading(false);
}
function setModalLoading(loading) {
  const text    = modalConfirm.querySelector('.btn-text');
  const spinner = modalConfirm.querySelector('.btn-spinner');
  modalConfirm.disabled = loading;
  text.classList.toggle('hidden', loading);
  spinner.classList.toggle('hidden', !loading);
}

// ── Utilities ──────────────────────────────────────────────
function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
}
