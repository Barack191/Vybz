// project.js — wires project page UI to the generic project logic defined in team.js

// Define user permissions
const PERMISSIONS = {
  postUpdate: ['Project Member','Team Lead','Project Manager','Admin'],
  editProject: ['Project Manager','Admin'],
  exportReport: ['Project Manager','Admin','Client'],
  addTask: ['Team Lead','Project Manager','Admin'],
  uploadDocument: ['Project Member','Team Lead','Project Manager','Admin'],
  newThread: ['Project Member','Team Lead','Project Manager','Admin','Client'],
  exportData: ['Project Manager','Admin'],
  updateReport: ['Project Manager','Admin'],
  attachFile: ['Project Member','Team Lead','Project Manager','Admin','Client'],
  // Manager-specific permissions
  editAnyContent: ['Project Manager','Admin'],
  addAnyContent: ['Project Manager','Admin'],
  removeAnyContent: ['Project Manager','Admin'],
  editRole: ['Project Manager']
};

// Get current user from localStorage
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || JSON.stringify({ id:'taylor', name:'Taylor Kim', role:'Project Member', roles:['Project Member'], initial:'T', email:'taylor@example.com' }));
}

// Check if user has permission for an action
function hasPermission(action) {
  const u = getCurrentUser();
  return u && (PERMISSIONS[action]||[]).includes(u.role);
}

// Get project store from localStorage
function getProjectStore() {
  return JSON.parse(localStorage.getItem('demoProjectStore') || '{}');
}

// Set project store in localStorage
function setProjectStore(s) {
  localStorage.setItem('demoProjectStore', JSON.stringify(s));
}

// Format time for display
function formatTime(ts) {
  return new Date(ts).toLocaleString();
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
  return ('' + str).replace(/[&<>\"]/g, function(c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
  });
}

// Broadcast event for real-time updates
function broadcastEvent(event) {
  localStorage.setItem('demoProjectBroadcast', JSON.stringify({ event, ts: Date.now() }));
}

// Render project feed
function renderFeed() {
  const s = getProjectStore();
  const feed = (s.project && s.project.feed) || [];
  const container = document.getElementById('projectFeed');
  if (!container) return;
  container.innerHTML = '';
  feed.slice().reverse().forEach(p => renderSinglePost(p));
}

// Render a single post
function renderSinglePost(post, prepend = false) {
  const container = document.getElementById('projectFeed');
  if (!container) return;
  if (document.getElementById('post-' + post.id)) return;
  
  const el = document.createElement('div');
  el.className = 'project-post';
  el.id = 'post-' + post.id;
  el.innerHTML = `
    <div class="post-header">
      <img class="post-avatar" src="https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=555&color=fff" alt="${post.author.name}">
      <div class="post-meta">
        <div class="post-author">${post.author.name} <span class="post-role">${post.author.role}</span></div>
        <div class="post-time">${formatTime(post.ts)}</div>
      </div>
    </div>
    <div class="post-body">${escapeHtml(post.content || '')}</div>
    <div class="post-attachments">${(post.attachments || []).map(a => `<div class="attach-item"><a href="${a.url}" download>${a.name}</a></div>`).join('')}</div>
    <div class="post-actions">
      <button class="btn-link like-btn" data-id="${post.id}">❤️ <span class="like-count">${post.likes || 0}</span></button>
      <button class="btn-link reply-btn" data-id="${post.id}">Reply</button>
    </div>
    <div class="post-replies" id="replies-${post.id}">${(post.replies || []).map(r => `<div class="reply"><strong>${r.author.name}:</strong> ${escapeHtml(r.text)}</div>`).join('')}</div>`;
  
  if (prepend) container.prepend(el);
  else container.appendChild(el);
}

// Post an update
function postUpdate(content, attachments) {
  const s = getProjectStore();
  const user = getCurrentUser();
  const id = 'p-' + Date.now();
  const post = {
    id,
    content,
    attachments: attachments || [],
    author: { id: user.id, name: user.name, role: user.role },
    ts: Date.now(),
    likes: 0,
    replies: []
  };
  
  s.project = s.project || {};
  s.project.feed = s.project.feed || [];
  s.project.feed.push(post);
  
  s.project.audit = s.project.audit || [];
  s.project.audit.push({ action: 'post', by: user.id, at: Date.now(), details: content.slice(0, 120) });
  
  setProjectStore(s);
  renderSinglePost(post, true);
  broadcastEvent({ type: 'newPost', post });
  
  showToast('Post published', 'success', 'Update shared to project feed');
  addNotificationForMembers(post);
}

// Add notification for project members
function addNotificationForMembers(post) {
  const np = document.querySelector('.notifications-list');
  if (np) {
    const item = document.createElement('div');
    item.className = 'notification-item';
    item.innerHTML = `<div class="notification-icon">💬</div><div class="notification-content"><h4>Project Update</h4><p>${post.author.name} posted an update</p><span class="notification-time">Now</span></div>`;
    np.prepend(item);
  }
  console.log('Simulated email notifications to project members');
}

// Handle post button click
function handlePostButton() {
  const input = document.getElementById('postInput');
  const attach = document.getElementById('postAttach');
  const btn = document.getElementById('postButton');
  
  if (!input) return;
  const val = input.value.trim();
  
  if (!val) {
    input.classList.add('input-warning');
    setTimeout(function() { input.classList.remove('input-warning'); }, 1500);
    return;
  }
  
  if (!hasPermission('postUpdate')) {
    showToast('Permission denied', 'error', 'You cannot post updates');
    return;
  }
  
  btn.disabled = true;
  btn.classList.add('loading');
  
  let attachments = [];
  // Attachments from composer browse
  if (attach && attach.files && attach.files.length) {
    Array.from(attach.files).forEach(function(f) {
      const fileObj = { name: f.name, url: URL.createObjectURL(f), size: f.size };
      attachments.push(fileObj);
      
      const s = getProjectStore();
      s.project = s.project || {};
      s.project.files = s.project.files || [];
      s.project.files.push({
        id: 'f-' + Date.now(),
        name: f.name,
        uploadedBy: getCurrentUser().id,
        url: fileObj.url,
        ts: Date.now(),
        version: 1
      });
      setProjectStore(s);
    });
    attach.value = '';
  }

  // Attachments added from Attach picker
  if (window.currentComposerAttachments && window.currentComposerAttachments.length) {
    attachments = attachments.concat(window.currentComposerAttachments.map(function(a) {
      // If it's a file-like object created from local file, keep url; if it's a project file reference, keep id and url
      return { name: a.name || a.filename, url: a.url || a._file && URL.createObjectURL(a._file), id: a.id, size: a.size };
    }));
  }
  
  setTimeout(function() {
    postUpdate(val, attachments);
    
    // Clear input with smooth animation
    input.classList.add('clearing');
    setTimeout(function() {
      input.value = '';
      input.classList.remove('clearing');
    }, 300);
    
    btn.disabled = false;
    btn.classList.remove('loading');
    
    // Clear attachment preview
    const preview = document.getElementById('attachPreview');
    if (preview) preview.innerHTML = '';
    // Reset composer attachments
    window.currentComposerAttachments = [];
  }, 700);
}

// Update project report
function updateReport() {
  try {
    if (!hasPermission('updateReport')) {
      showToast('Permission denied', 'error');
      return;
    }
    
    const s = getProjectStore();
    const tasks = (s.project && s.project.tasks) || [];
    const total = tasks.length;
    const done = tasks.filter(function(t) { return t.status === 'done'; }).length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    
    s.project = s.project || {};
    s.project.metrics = { totalTasks: total, done, completionPercent: percent };
    
    s.project.audit = s.project.audit || [];
    s.project.audit.push({ 
      action: 'updateReport', 
      by: getCurrentUser().id, 
      at: Date.now(), 
      details: JSON.stringify(s.project.metrics) 
    });
    
    setProjectStore(s);
    
    const kpi = document.getElementById('projectCompletionPercent');
    if (kpi) kpi.textContent = percent + '%';
    
    showToast('Report updated', 'success', 'Project metrics refreshed');
  } catch(err) {
    console.warn('updateReport error', err);
    showToast('Update failed', 'error');
  }
}

// Generate report
function generateReport(format) {
  try {
    if (!hasPermission('exportReport')) {
      showToast('Permission denied', 'error');
      return;
    }
    
    const s = getProjectStore();
    const project = s.project || {};
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    let content = '', mime = 'text/plain';
    let ext = format;
    if (format === 'excel') ext = 'xlsx';
    const filename = `${(project.name || 'project').replace(/\s+/g, '-')}-report-${ts}.${ext}`;
    
    if (format === 'pdf') {
      mime = 'application/pdf';
      content = 'Report - ' + project.name + '\nGenerated: ' + new Date().toLocaleString() + '\n\n' + (project.description || '');
    } else {
      mime = 'text/csv';
      content = 'Section,Value\nName,"' + project.name + '"\nStatus,' + (project.status || '') + '\nBudget,' + (project.budget || 0);
    }
    
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    
    s.project = s.project || {};
    s.project.reports = s.project.reports || [];
    s.project.reports.push({ id: 'r-' + Date.now(), format, ts: Date.now(), filename });
    setProjectStore(s);
    
    showToast('Report exported', 'success', 'Downloaded ' + filename);
  } catch(err) {
    console.warn('generateReport error', err);
    showToast('Export failed', 'error');
  }
}

// Export raw data
function exportData() {
  try {
    if (!hasPermission('exportData')) {
      showToast('Permission denied', 'error');
      return;
    }
    
    const s = getProjectStore();
    const data = { 
      tasks: (s.project && s.project.tasks) || [], 
      budget: { budget: (s.project && s.project.budget) || 0 },
      timeLogs: []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(s.project && s.project.name || 'project')}-raw-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    
    showToast('Data exported', 'success', 'Raw project data downloaded');
  } catch(err) {
    console.warn('exportData error', err);
    showToast('Export failed', 'error');
  }
}

// Save new task
function saveNewTask() {
  const m = document.getElementById('addTaskModal');
  const title = m.querySelector('#taskTitle').value.trim();
  
  if (!title) {
    m.querySelector('#taskTitle').classList.add('input-warning');
    setTimeout(function() { m.querySelector('#taskTitle').classList.remove('input-warning'); }, 1500);
    return;
  }
  
  if (!hasPermission('addTask')) {
    showToast('Permission denied', 'error');
    return;
  }
  
  const task = {
    id: 't-' + Date.now(),
    title,
    description: m.querySelector('#taskDesc').value.trim(),
    priority: m.querySelector('#taskPriority').value,
    assignee: m.querySelector('#taskAssignee').value,
    deadline: m.querySelector('#taskDeadline').value,
    status: 'open',
    createdBy: getCurrentUser().id,
    ts: Date.now()
  };
  
  const s = getProjectStore();
  s.project = s.project || {};
  s.project.tasks = s.project.tasks || [];
  s.project.tasks.push(task);
  
  s.project.audit = s.project.audit || [];
  s.project.audit.push({ 
    action: 'addTask', 
    by: getCurrentUser().id, 
    at: Date.now(), 
    details: task.title 
  });
  
  setProjectStore(s);
  document.getElementById('addTaskModal').classList.remove('active');
  showToast('Task added', 'success', 'Task "' + task.title + '" created');
  
  // Update report metrics
  updateReport();
}

// Save new thread
function saveNewThread() {
  const m = document.getElementById('newThreadModal');
  const title = m.querySelector('#threadTitle').value.trim();
  const body = m.querySelector('#threadBody').value.trim();
  
  if (!title || !body) {
    showToast('Validation', 'warning', 'Please provide title and message');
    return;
  }
  
  if (!hasPermission('newThread')) {
    showToast('Permission denied', 'error');
    return;
  }
  
  const s = getProjectStore();
  s.project = s.project || {};
  s.project.threads = s.project.threads || [];
  s.project.threads.push({ 
    id: 'th-' + Date.now(), 
    title, 
    body, 
    author: getCurrentUser(), 
    ts: Date.now(), 
    replies: [] 
  });
  
  s.project.audit = s.project.audit || [];
  s.project.audit.push({ 
    action: 'newThread', 
    by: getCurrentUser().id, 
    at: Date.now(), 
    details: title 
  });
  
  setProjectStore(s);
  document.getElementById('newThreadModal').classList.remove('active');
  showToast('Thread created', 'success', 'Your thread has been created');
}

// Open edit project modal
function openEditProjectModal() {
  try {
    if (!hasPermission('editProject')) {
      showToast('Permission denied', 'error');
      return;
    }
    
    const s = getProjectStore();
    const p = s.project || {};
    
    const nameEl = document.getElementById('projName');
    if (nameEl) nameEl.value = p.name || '';
    
    const descEl = document.getElementById('projDesc');
    if (descEl) descEl.value = p.description || '';
    
    const dl = document.getElementById('projDeadline');
    if (dl) dl.value = p.deadline || '';
    
    const bd = document.getElementById('projBudget');
    if (bd) bd.value = p.budget || '';
    
    const editModal = document.getElementById('editProjectModal');
    if (editModal) editModal.classList.toggle('active');
  } catch(err) {
    console.warn('openEditProjectModal error', err);
    showToast('Edit failed', 'error');
  }
}

// Save project edits
function saveProjectEdits() {
  try {
    if (!hasPermission('editProject')) {
      showToast('Permission denied', 'error');
      return;
    }
    
    const s = getProjectStore();
    const p = s.project || {};
    
    const updates = {
      name: document.getElementById('projName').value.trim(),
      description: document.getElementById('projDesc').value.trim(),
      deadline: document.getElementById('projDeadline').value,
      budget: Number(document.getElementById('projBudget').value) || 0
    };
    
    s.project = Object.assign({}, p, updates);
    
    s.project.audit = s.project.audit || [];
    s.project.audit.push({ 
      action: 'editProject', 
      by: getCurrentUser().id, 
      at: Date.now(), 
      details: JSON.stringify(updates) 
    });
    
    setProjectStore(s);
    broadcastEvent({ type: 'updateProject', updates });
    
    document.getElementById('editProjectModal').classList.remove('active');
    showToast('Project saved', 'success');
  } catch(err) {
    console.warn('saveProjectEdits error', err);
    showToast('Save failed', 'error');
  }
}

// Upload document
function uploadDocument() {
  if (!hasPermission('uploadDocument')) {
    showToast('Permission denied', 'error');
    return;
  }
  
  const fileInput = document.getElementById('fileInput') || document.getElementById('uploadDocInput');
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    showToast('No Files Selected', 'error', 'Please select files to upload');
    return;
  }
  
  Array.from(fileInput.files).forEach(function(f) {
    showToast('Scanning file', 'info', 'Scanning ' + f.name + '...');
    
    setTimeout(function() {
      const s = getProjectStore();
      s.project = s.project || {};
      s.project.files = s.project.files || [];
      s.project.files.push({
        id: 'f-' + Date.now(),
        name: f.name,
        uploadedBy: getCurrentUser().id,
        url: URL.createObjectURL(f),
        ts: Date.now(),
        version: 1
      });
      setProjectStore(s);
      
      showToast('Uploaded', 'success', f.name + ' uploaded and attached to project');
      
      // Update document grid if exists
      const docGrid = document.querySelector('.documents-grid');
      if (docGrid) {
        const card = document.createElement('div');
        card.className = 'document-card';
        card.innerHTML = `<div class="doc-icon">📄</div><div class="doc-info"><h4>${f.name}</h4><p>Uploaded just now</p></div><div class="doc-actions"><button class="icon-btn small" title="Download">⬇</button><button class="icon-btn small" title="Delete">🗑</button></div>`;
        docGrid.prepend(card);
      }
    }, 800);
  });
  
  if (document.getElementById('fileUploadModal')) {
    document.getElementById('fileUploadModal').classList.remove('active');
  }
  
  if (fileInput) fileInput.value = '';
  
  const uploadedFiles = document.getElementById('uploadedFiles');
  if (uploadedFiles) uploadedFiles.innerHTML = '';
}

// Show toast notification
function showToast(title, type = 'success', message = '') {
  // This function is defined in main.js, but if not available, we'll implement a fallback
  if (typeof window.showToast === 'function') {
    window.showToast(title, type, message);
  } else {
    // Fallback implementation
    const toastContainer = document.getElementById('toastContainer') || document.querySelector('.toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.success}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(function() {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
  }
}

// Like and reply functionality
function setupPostInteractions() {
  document.addEventListener('click', function(e) {
    if (e.target.closest('.like-btn')) {
      const id = e.target.closest('.like-btn').dataset.id;
      const s = getProjectStore();
      const post = (s.project.feed || []).find(function(p) { return p.id === id; });
      if (!post) return;
      
      post.likes = (post.likes || 0) + 1;
      setProjectStore(s);
      
      const el = document.querySelector('#post-' + id + ' .like-count');
      if (el) el.textContent = post.likes;
      
      s.project.audit = s.project.audit || [];
      s.project.audit.push({ action: 'like', by: getCurrentUser().id, at: Date.now(), details: id });
    }
    
    if (e.target.closest('.reply-btn')) {
      const id = e.target.closest('.reply-btn').dataset.id;
      const repliesEl = document.getElementById('replies-' + id);
      if (!repliesEl) return;
      
      if (document.getElementById('reply-box-' + id)) return;
      
      const box = document.createElement('div');
      box.className = 'reply-box';
      box.id = 'reply-box-' + id;
      box.innerHTML = `<input placeholder="Write a reply..." class="reply-input" id="reply-input-${id}"><button class="btn-primary" id="reply-send-${id}">Send</button>`;
      repliesEl.appendChild(box);
      
      document.getElementById('reply-send-' + id).addEventListener('click', function() {
        const val = document.getElementById('reply-input-' + id).value.trim();
        if (!val) return;
        
        const s = getProjectStore();
        const post = (s.project.feed || []).find(function(p) { return p.id === id; });
        if (!post) return;
        
        const reply = {
          text: val,
          author: { id: getCurrentUser().id, name: getCurrentUser().name },
          ts: Date.now()
        };
        
        post.replies = post.replies || [];
        post.replies.push(reply);
        setProjectStore(s);
        
        const replyEl = document.createElement('div');
        replyEl.className = 'reply';
        replyEl.innerHTML = `<strong>${reply.author.name}:</strong> ${escapeHtml(reply.text)}`;
        repliesEl.appendChild(replyEl);
        box.remove();
      });
    }
  });
}

// Hide/disable buttons for unauthorized users (now we keep them visible and show disabled state)
function setButtonDisabled(btn, reason) {
  if (!btn) return;
  btn.disabled = true;
  btn.classList.add('disabled');
  btn.title = reason || 'You do not have permission';
  btn.setAttribute('aria-disabled', 'true');
}

function hideUnauthorizedButtons() {
  if (!hasPermission('editProject')) {
    const btn = document.getElementById('openEditProject');
    setButtonDisabled(btn, 'Only Project Managers and Admins can edit the project');
  }
  
  if (!hasPermission('exportReport')) {
    const btn = document.getElementById('exportReportBtn');
    setButtonDisabled(btn, 'Only Project Managers, Admins, or Clients can export reports');
  }
  
  if (!hasPermission('addTask')) {
    const btn = document.getElementById('addTaskBtn');
    setButtonDisabled(btn, 'Only Team Leads, Project Managers, or Admins can add tasks');
  }
  
  if (!hasPermission('uploadDocument')) {
    const btn = document.getElementById('uploadDocBtn');
    setButtonDisabled(btn, 'Only authorized members can upload documents');
  }
  
  if (!hasPermission('exportData')) {
    const btn = document.getElementById('exportDataBtn');
    setButtonDisabled(btn, 'Only Admins and Project Managers can export raw data');
  }
  
  if (!hasPermission('updateReport')) {
    const btn = document.getElementById('updateReportBtn');
    setButtonDisabled(btn, 'Only Admins and Project Managers can update reports');
  }
}

// Manager editing functionality
function enableManagerEditing() {
  if (!hasPermission('editAnyContent')) return;
  
  // Add edit buttons to all content
  addEditButtonsToContent();
  
  // Enable drag and drop for reordering
  enableDragAndDrop();
  
  // Add context menu for managers
  addContextMenu();
}

// Add edit buttons to all content
function addEditButtonsToContent() {
  // Add edit buttons to all major content sections
  const contentElements = document.querySelectorAll(
    '.project-post, .task-card, .document-card, .team-member, .service-card, .action-card, .stat-card, .achievement-card, .culture-card'
  );
  
  contentElements.forEach(function(element) {
    // Create edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'manager-edit-btn';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Edit this content';
    editBtn.onclick = function() {
      openEditModal(element);
    };
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'manager-delete-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete this content';
    deleteBtn.onclick = function() {
      deleteContent(element);
    };
    
    // Create container for buttons
    const btnContainer = document.createElement('div');
    btnContainer.className = 'manager-controls';
    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);
    
    // Add the container to the element
    element.style.position = 'relative';
    element.appendChild(btnContainer);
  });
}

// Open edit modal for content
function openEditModal(element) {
  const content = element.innerHTML;
  
  // Create modal for editing
  let modal = document.getElementById('managerEditModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'managerEditModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="width: 80%; max-width: 800px;">
        <div class="modal-header">
          <h2>Edit Content</h2>
          <button class="close-modal" id="closeManagerEditModal">&times;</button>
        </div>
        <div class="modal-body">
          <textarea id="editContentArea" style="width: 100%; height: 300px; padding: 10px; font-family: monospace;"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="cancelManagerEdit">Cancel</button>
          <button class="btn-primary" id="saveManagerEdit">Save Changes</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  // Set current content in the textarea
  document.getElementById('editContentArea').value = content;
  
  // Store reference to the element being edited
  modal.dataset.editingElement = element;
  
  // Show the modal
  modal.classList.add('active');
  
  // Add event listeners for the modal
  document.getElementById('closeManagerEditModal').onclick = function() {
    modal.classList.remove('active');
  };
  
  document.getElementById('cancelManagerEdit').onclick = function() {
    modal.classList.remove('active');
  };
  
  document.getElementById('saveManagerEdit').onclick = function() {
    const newContent = document.getElementById('editContentArea').value;
    element.innerHTML = newContent;
    modal.classList.remove('active');
    showToast('Content Updated', 'success', 'Content has been updated successfully');
  };
}

// Delete content
function deleteContent(element) {
  if (confirm('Are you sure you want to delete this content?')) {
    element.remove();
    showToast('Content Deleted', 'info', 'Content has been removed');
  }
}

// Enable drag and drop for reordering
function enableDragAndDrop() {
  if (!hasPermission('editAnyContent')) return;
  
  const draggables = document.querySelectorAll('.project-post, .task-card, .document-card');
  const containers = document.querySelectorAll('.project-feed, .tasks-grid, .documents-grid');
  
  draggables.forEach(draggable => {
    draggable.setAttribute('draggable', true);
    
    draggable.addEventListener('dragstart', function() {
      this.classList.add('dragging');
    });
    
    draggable.addEventListener('dragend', function() {
      this.classList.remove('dragging');
    });
  });
  
  containers.forEach(container => {
    container.addEventListener('dragover', function(e) {
      e.preventDefault();
      const afterElement = getDragAfterElement(container, e.clientY);
      const draggable = document.querySelector('.dragging');
      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
      }
    });
  });
}

// Helper function for drag and drop
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.project-post:not(.dragging), .task-card:not(.dragging), .document-card:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Add context menu for managers
function addContextMenu() {
  if (!hasPermission('editAnyContent')) return;
  
  document.addEventListener('contextmenu', function(e) {
    // Check if we're on content that can be managed
    const contentElement = e.target.closest('.project-post, .task-card, .document-card, .team-member, .service-card, .action-card, .stat-card, .achievement-card, .culture-card');
    
    if (contentElement) {
      e.preventDefault();
      
      // Create context menu
      let menu = document.getElementById('managerContextMenu');
      if (menu) menu.remove();
      
      menu = document.createElement('div');
      menu.id = 'managerContextMenu';
      menu.className = 'context-menu';
      menu.style.position = 'absolute';
      menu.style.left = e.pageX + 'px';
      menu.style.top = e.pageY + 'px';
      menu.style.backgroundColor = '#1a1a2e';
      menu.style.border = '1px solid #00d4ff';
      menu.style.borderRadius = '4px';
      menu.style.padding = '5px 0';
      menu.style.zIndex = '10000';
      menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      menu.innerHTML = `
        <div class="context-menu-item" id="editContent">Edit Content</div>
        <div class="context-menu-item" id="deleteContent">Delete Content</div>
        <div class="context-menu-item" id="duplicateContent">Duplicate Content</div>
      `;
      
      document.body.appendChild(menu);
      
      // Add event listeners
      document.getElementById('editContent').onclick = function() {
        openEditModal(contentElement);
        menu.remove();
      };
      
      document.getElementById('deleteContent').onclick = function() {
        deleteContent(contentElement);
        menu.remove();
      };
      
      document.getElementById('duplicateContent').onclick = function() {
        duplicateContent(contentElement);
        menu.remove();
      };
      
      // Remove menu when clicking elsewhere
      document.addEventListener('click', function removeMenu() {
        menu.remove();
        document.removeEventListener('click', removeMenu);
      });
    }
  });
}

// Duplicate content
function duplicateContent(element) {
  const newElement = element.cloneNode(true);
  element.parentNode.insertBefore(newElement, element.nextSibling);
  
  // Re-enable manager controls for the new element
  if (hasPermission('editAnyContent')) {
    addEditButtonsToContent();
  }
  
  showToast('Content Duplicated', 'success', 'Content has been duplicated');
}

// Add manager toolbar
function addManagerToolbar() {
  if (!hasPermission('addAnyContent')) return;
  
  // Create toolbar
  let toolbar = document.getElementById('managerToolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'managerToolbar';
    toolbar.innerHTML = `
      <div class="toolbar-btn" title="Add New Section" id="addNewSection">➕ Section</div>
      <div class="toolbar-btn" title="Add New Task" id="addNewTask">➕ Task</div>
      <div class="toolbar-btn" title="Add New Post" id="addNewPost">➕ Post</div>
      <div class="toolbar-btn" title="Add New Document" id="addNewDocument">➕ Document</div>
    `;
    toolbar.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #000;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toolbar);
  }
  
  // Add event listeners
  document.getElementById('addNewSection').onclick = function() {
    addNewSection();
  };
  
  document.getElementById('addNewTask').onclick = function() {
    addNewTask();
  };
  
  document.getElementById('addNewPost').onclick = function() {
    addNewPost();
  };
  
  document.getElementById('addNewDocument').onclick = function() {
    addNewDocument();
  };
}

// Add new section
function addNewSection() {
  const sectionName = prompt('Enter section name:');
  if (sectionName) {
    const newSection = document.createElement('div');
    newSection.className = 'section';
    newSection.innerHTML = `
      <h2>${sectionName}</h2>
      <p>New section content...</p>
    `;
    document.body.appendChild(newSection);
    showToast('Section Added', 'success', 'New section has been added');
  }
}

// Add new task
function addNewTask() {
  const taskTitle = prompt('Enter task title:');
  if (taskTitle) {
    const taskDesc = prompt('Enter task description (optional):', 'No description');
    
    // Find the tasks grid or create one
    let tasksGrid = document.querySelector('.tasks-grid');
    if (!tasksGrid) {
      const taskSection = document.createElement('div');
      taskSection.className = 'task-breakdown';
      taskSection.innerHTML = `
        <div class="section-header">
          <h2 class="section-title">Task Breakdown</h2>
        </div>
        <div class="tasks-grid"></div>
      `;
      document.querySelector('.project-content')?.appendChild(taskSection);
      tasksGrid = document.querySelector('.tasks-grid');
    }
    
    const newTask = document.createElement('div');
    newTask.className = 'task-card';
    newTask.innerHTML = `
      <h4>${taskTitle}</h4>
      <p>${taskDesc}</p>
      <div class="task-meta">
        <span class="task-status">To Do</span>
        <span class="task-priority">Medium</span>
      </div>
    `;
    tasksGrid.appendChild(newTask);
    
    // Add manager controls to the new task
    if (hasPermission('editAnyContent')) {
      addEditButtonsToContent();
    }
    
    showToast('Task Added', 'success', 'New task has been added');
  }
}

// Add new post
function addNewPost() {
  const postContent = prompt('Enter post content:');
  if (postContent) {
    // Find the project feed or create one
    let projectFeed = document.getElementById('projectFeed');
    if (!projectFeed) {
      const discussionBoard = document.createElement('div');
      discussionBoard.className = 'discussion-board';
      discussionBoard.innerHTML = `
        <div class="section-header">
          <h2 class="section-title">Discussion Board</h2>
        </div>
        <div id="projectFeed" class="project-feed"></div>
      `;
      document.querySelector('.project-content')?.appendChild(discussionBoard);
      projectFeed = document.getElementById('projectFeed');
    }
    
    const user = getCurrentUser();
    const newPost = document.createElement('div');
    newPost.className = 'project-post';
    newPost.innerHTML = `
      <div class="post-header">
        <img class="post-avatar" src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=555&color=fff" alt="${user.name}">
        <div class="post-meta">
          <div class="post-author">${user.name} <span class="post-role">${user.role}</span></div>
          <div class="post-time">Just now</div>
        </div>
      </div>
      <div class="post-body">${escapeHtml(postContent)}</div>
      <div class="post-actions">
        <button class="btn-link like-btn">❤️ <span class="like-count">0</span></button>
        <button class="btn-link reply-btn">Reply</button>
      </div>
    `;
    projectFeed.prepend(newPost);
    
    // Add manager controls to the new post
    if (hasPermission('editAnyContent')) {
      addEditButtonsToContent();
    }
    
    showToast('Post Added', 'success', 'New post has been added');
  }
}

// Add new document
function addNewDocument() {
  const docName = prompt('Enter document name:');
  if (docName) {
    // Find the documents grid or create one
    let docsGrid = document.querySelector('.documents-grid');
    if (!docsGrid) {
      const docSection = document.createElement('div');
      docSection.className = 'document-repository';
      docSection.innerHTML = `
        <div class="section-header">
          <h2 class="section-title">Document Repository</h2>
        </div>
        <div class="documents-grid"></div>
      `;
      document.querySelector('.project-content')?.appendChild(docSection);
      docsGrid = document.querySelector('.documents-grid');
    }
    
    const newDoc = document.createElement('div');
    newDoc.className = 'document-card';
    newDoc.innerHTML = `
      <div class="doc-icon">📄</div>
      <div class="doc-info">
        <h4>${docName}</h4>
        <p>Uploaded just now</p>
      </div>
      <div class="doc-actions">
        <button class="icon-btn small" title="Download">⬇</button>
        <button class="icon-btn small" title="Delete">🗑</button>
      </div>
    `;
    docsGrid.appendChild(newDoc);
    
    // Add manager controls to the new document
    if (hasPermission('editAnyContent')) {
      addEditButtonsToContent();
    }
    
    showToast('Document Added', 'success', 'New document has been added');
  }
}

// Apply manager functionality on page load
function applyManagerFeatures() {
  if (hasPermission('editAnyContent')) {
    // Add edit buttons to existing content
    setTimeout(addEditButtonsToContent, 1000); // Wait for content to load
    
    // Add manager toolbar
    addManagerToolbar();
    
    // Add context menu
    addContextMenu();
    
    // Enable drag and drop
    enableDragAndDrop();
    
    // Add CSS for manager controls
    addManagerStyles();
  }
}

// Add CSS styles for manager controls
function addManagerStyles() {
  let style = document.getElementById('managerStyles');
  if (!style) {
    style = document.createElement('style');
    style.id = 'managerStyles';
    style.textContent = `
      .manager-controls {
        position: absolute;
        top: 5px;
        right: 5px;
        display: flex;
        gap: 5px;
        z-index: 100;
      }
      
      .manager-edit-btn, .manager-delete-btn {
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: 1px solid #00d4ff;
        border-radius: 3px;
        padding: 2px 6px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .manager-edit-btn:hover, .manager-delete-btn:hover {
        background: rgba(0, 212, 255, 0.3);
      }
      
      .dragging {
        opacity: 0.5;
      }
      
      .context-menu {
        position: absolute;
        background: #1a1a2e;
        border: 1px solid #00d4ff;
        border-radius: 4px;
        padding: 5px 0;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      
      .context-menu-item {
        padding: 8px 15px;
        cursor: pointer;
        color: #f0f0f0;
        font-size: 14px;
      }
      
      .context-menu-item:hover {
        background: rgba(0, 212, 255, 0.3);
      }
      
      .toolbar-btn {
        padding: 8px 12px;
        background: #333;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        text-align: center;
        border: 1px solid #00d4ff;
      }
      
      .toolbar-btn:hover {
        background: #00d4ff;
        color: black;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize the project page
document.addEventListener('DOMContentLoaded', function() {
  // Highlight nav
  document.querySelectorAll('.nav-btn').forEach(function(btn) { btn.classList.remove('active'); });
  const projectsBtn = document.querySelector('.nav-btn[data-section="projects"]');
  if (projectsBtn) projectsBtn.classList.add('active');

  // Hide unauthorized buttons
  hideUnauthorizedButtons();

  // Apply manager features if user has permissions
  applyManagerFeatures();

  // Setup post interactions
  setupPostInteractions();

  // Composer attachments (supports Browse and Attach from project files)
  window.currentComposerAttachments = [];
  function addComposerAttachment(att) {
    window.currentComposerAttachments = window.currentComposerAttachments || [];
    window.currentComposerAttachments.push(att);
    const attachPreview = document.getElementById('attachPreview');
    if (!attachPreview) return;
    const d = document.createElement('div');
    d.className = 'attach-preview-item';
    d.textContent = att.name || att.filename || 'attachment';
    attachPreview.appendChild(d);
  }

  const attachBtn = document.getElementById('attachButton');
  const postAttach = document.getElementById('postAttach');
  const attachPickerModal = document.getElementById('attachPickerModal');

  if (attachBtn) {
    attachBtn.addEventListener('click', function() {
      // Toggle the attach options modal
      if (attachPickerModal) attachPickerModal.classList.toggle('active');
    });
  }

  // Browse action from attach modal
  document.getElementById('attachBrowseBtn')?.addEventListener('click', function() {
    if (postAttach) postAttach.click();
  });

  // Show project files in attach modal
  document.getElementById('attachProjectFilesBtn')?.addEventListener('click', function() {
    const list = document.getElementById('attachProjectFilesList');
    list.innerHTML = '';
    const s = getProjectStore();
    const files = (s.project && s.project.files) || [];
    if (!files.length) {
      list.innerHTML = '<p class="muted">No project files found</p>';
      return;
    }
    files.slice().reverse().forEach(function(f) {
      const row = document.createElement('div');
      row.className = 'project-file-row';
      row.innerHTML = `<span>${f.name}</span> <button class="btn-secondary btn-sm attach-from-project" data-fileid="${f.id}">Attach</button>`;
      list.appendChild(row);
    });
  });

  // Handle attaching from project files list
  document.addEventListener('click', function(e) {
    const b = e.target.closest('.attach-from-project');
    if (!b) return;
    const id = b.dataset.fileid;
    const s = getProjectStore();
    const f = (s.project && s.project.files || []).find(x => x.id === id);
    if (!f) return;
    addComposerAttachment({ name: f.name, url: f.url, id: f.id });
    document.getElementById('attachPickerModal')?.classList.remove('active');
  });

  // When browsing local files for composer
  if (postAttach) {
    postAttach.addEventListener('change', function() {
      const attachPreview = document.getElementById('attachPreview');
      if (!attachPreview) return;
      Array.from(this.files || []).forEach(function(f) {
        const fileObj = { name: f.name, url: URL.createObjectURL(f), size: f.size, _file: f };
        addComposerAttachment(fileObj);
      });
    });
  }

  // Post button triggers handler
  const postBtn = document.getElementById('postButton');
  if (postBtn) {
    postBtn.addEventListener('click', handlePostButton);
    
    // Support Ctrl+Enter to post from textarea
    const input = document.getElementById('postInput');
    if (input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          postBtn.click();
        }
      });
    }
  }

  // Edit Project button
  document.getElementById('openEditProject')?.addEventListener('click', openEditProjectModal);

  // Save project edits
  document.getElementById('saveProjectEdits')?.addEventListener('click', saveProjectEdits);

  // Export Report - toggle modal
  document.getElementById('exportReportBtn')?.addEventListener('click', function() {
    if (!hasPermission('exportReport')) {
      showToast('Permission denied', 'error', 'You don\'t have permission to export reports');
      return;
    }
    const modal = document.getElementById('exportModal');
    if (modal) modal.classList.toggle('active');
  });

  // Generate report from modal
  document.querySelectorAll('#exportModal .btn-primary').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const format = this.dataset.format || 'pdf';
      generateReport(format);
    });
  });

  // Add Task button - toggle modal
  document.getElementById('addTaskBtn')?.addEventListener('click', function() {
    if (!hasPermission('addTask')) {
      showToast('Permission denied', 'error', 'You don\'t have permission to add tasks');
      return;
    }
    const modal = document.getElementById('addTaskModal');
    if (modal) modal.classList.toggle('active');
  });

  // Save new task
  document.querySelector('#addTaskModal button.btn-primary')?.addEventListener('click', saveNewTask);

  // New Thread button - toggle modal
  document.getElementById('createThreadBtn')?.addEventListener('click', function() {
    if (!hasPermission('newThread')) {
      showToast('Permission denied', 'error', 'You don\'t have permission to create threads');
      return;
    }
    const modal = document.getElementById('newThreadModal');
    if (modal) modal.classList.toggle('active');
  });

  // Save new thread
  document.querySelector('#newThreadModal button.btn-primary')?.addEventListener('click', saveNewThread);

  // Export Data button
  document.getElementById('exportDataBtn')?.addEventListener('click', function() {
    if (hasPermission('exportData')) {
      exportData();
    } else {
      showToast('Permission denied', 'error', 'You don\'t have permission to export data');
    }
  });

  // Update Report button
  document.getElementById('updateReportBtn')?.addEventListener('click', function() {
    if (hasPermission('updateReport')) {
      updateReport();
    } else {
      showToast('Permission denied', 'error', 'You don\'t have permission to update reports');
    }
  });

  // Upload Document button - toggle upload modal or trigger hidden input
  document.getElementById('uploadDocBtn')?.addEventListener('click', function() {
    if (!hasPermission('uploadDocument')) {
      showToast('Permission denied', 'error', 'You don\'t have permission to upload documents');
      return;
    }
    const modal = document.getElementById('fileUploadModal');
    if (modal) {
      modal.classList.toggle('active');
    } else {
      const hidden = document.getElementById('uploadDocInput');
      if (hidden) hidden.click();
      else showToast('Upload not available', 'warning', 'Upload UI not found');
    }
  });

  // Upload files
  document.getElementById('uploadFiles')?.addEventListener('click', uploadDocument);

  // Upload area drag & drop and preview handling
  const uploadArea = document.getElementById('uploadArea');
  const fileInputModal = document.getElementById('fileInput');
  const uploadedFilesEl = document.getElementById('uploadedFiles');
  if (uploadArea && fileInputModal) {
    uploadArea.addEventListener('click', function() { fileInputModal.click(); });
    uploadArea.addEventListener('dragover', function(e) { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', function(e) { e.preventDefault(); uploadArea.classList.remove('dragover'); });
    uploadArea.addEventListener('drop', function(e) {
      e.preventDefault(); uploadArea.classList.remove('dragover');
      const files = Array.from(e.dataTransfer.files || []);
      if (!files.length) return;
      fileInputModal.files = e.dataTransfer.files;
      // render preview
      if (uploadedFilesEl) uploadedFilesEl.innerHTML = '';
      files.forEach(function(f) {
        const row = document.createElement('div');
        row.className = 'uploaded-file-row';
        row.textContent = f.name + ' • ' + Math.round(f.size/1024) + ' KB';
        if (uploadedFilesEl) uploadedFilesEl.appendChild(row);
      });
    });

    fileInputModal.addEventListener('change', function() {
      const files = Array.from(this.files || []);
      if (uploadedFilesEl) uploadedFilesEl.innerHTML = '';
      files.forEach(function(f) {
        const row = document.createElement('div');
        row.className = 'uploaded-file-row';
        row.textContent = f.name + ' • ' + Math.round(f.size/1024) + ' KB';
        if (uploadedFilesEl) uploadedFilesEl.appendChild(row);
      });
    });
  }

  // Cancel upload
  document.getElementById('cancelUpload')?.addEventListener('click', function() {
    document.getElementById('fileInput').value = '';
    const uploadedFilesEl = document.getElementById('uploadedFiles');
    if (uploadedFilesEl) uploadedFilesEl.innerHTML = '';
    document.getElementById('fileUploadModal')?.classList.remove('active');
  });

  // Close modal helper
  document.querySelectorAll('.modal .close-modal').forEach(function(b) {
    b.addEventListener('click', function() {
      const id = this.dataset.close;
      if (id) document.getElementById(id)?.classList.remove('active');
      else this.closest('.modal')?.classList.remove('active');
    });
  });

  // Make document delete work (front-end)
  document.addEventListener('click', function(e) {
    if (e.target.closest('.document-card .icon-btn[title="Delete"]')) {
      if (confirm('Delete document?')) {
        e.target.closest('.document-card')?.remove();
        showToast('Document deleted', 'success');
      }
    }
  });

  // Initialize project feed
  renderFeed();
  updateReport();
});

// Listen for theme changes from other tabs
window.addEventListener('storage', function(e) {
  if (e.key === 'themeBroadcast' && e.newValue) {
    try {
      const data = JSON.parse(e.newValue);
      if (data.theme && data.timestamp) {
        // Only update if it's a newer broadcast
        const currentBroadcast = localStorage.getItem('themeBroadcastLastApplied');
        if (!currentBroadcast || JSON.parse(currentBroadcast).timestamp < data.timestamp) {
          document.body.setAttribute('data-theme', data.theme);
          localStorage.setItem('theme', data.theme);
          localStorage.setItem('themeBroadcastLastApplied', e.newValue);
        }
      }
    } catch (err) {
      console.error('Error parsing theme broadcast:', err);
    }
  }
});

// Function to send message to AI API
async function getAIResponse(message) {
  // First try to connect to the backend API
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.response;
    } else {
      console.error('AI API Error:', data.error);
      // If API call fails, use simulated responses
      return generateCompanyResponse(message);
    }
  } catch (error) {
    console.error('Network error or server not running:', error);
    // Fallback to simulated responses
    return generateCompanyResponse(message);
  }
}

// Send message function to use AI API
async function sendMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;
  const messagesContainer = document.getElementById('chatMessages');
  if (!messagesContainer) return;
  
  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.innerHTML = `<div>${message}</div>`;
  messagesContainer.appendChild(userMsg);
  
  input.value = '';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message bot';
  typingIndicator.id = 'typing-indicator';
  typingIndicator.innerHTML = `<div><i>AI is thinking...</i></div>`;
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  try {
    // Get response from AI API
    const response = await getAIResponse(message);
    
    // Remove typing indicator
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
    
    // Add AI response
    const botMsg = document.createElement('div');
    botMsg.className = 'message bot';
    botMsg.innerHTML = `<div>${response}</div>`;
    messagesContainer.appendChild(botMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
    // Remove typing indicator
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
    
    // Add error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'message bot';
    errorMsg.innerHTML = `<div>I'm having trouble connecting to our AI service. Please try again later.</div>`;
    messagesContainer.appendChild(errorMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Add event listener for chat send button
document.addEventListener('click', function(e) {
  if (e.target.id === 'chatSend') {
    sendMessage();
  }
});

// Add event listener for Enter key in chat input
document.addEventListener('keydown', function(e) {
  if (e.target && e.target.id === 'chatInput' && e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});