  // Team-specific JavaScript
    const teamMemberData = {
      'barack-omondi': {
        name: 'Barack Omondi',
        role: 'Chief Executive Officer',
        department: 'Leadership',
        status: 'online',
        bio: 'Visionary leader with 15+ years in tech innovation. Passionate about transforming businesses through digital solutions. Drives strategic vision and cultural excellence across all departments.',
        specializations: ['Digital Transformation', 'Strategic Planning', 'Team Leadership'],
        skills: ['Leadership', 'Strategy', 'Innovation', 'Decision Making'],
        projects: ['Project X', 'Digital Transformation Initiative'],
        activity: ['Started strategic review meeting', 'Approved Q1 roadmap', 'Recorded vision video'],
        links: [{ name: 'LinkedIn', url: '#' }, { name: 'Twitter', url: '#' }]
      },
      'jordan-lee': {
        name: 'Jordan Lee',
        role: 'Lead Developer',
        department: 'Engineering',
        status: 'busy',
        bio: 'Full-stack developer specializing in cloud solutions and microservices architecture. Open-source contributor with expertise in modern frameworks and infrastructure design.',
        specializations: ['Microservices', 'Cloud Architecture', 'API Design'],
        skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'Docker'],
        projects: ['Cloud Migration', 'Backend API Redesign'],
        activity: ['Merged PR #456', 'Deployed v2.1 to production', 'Code review completed'],
        links: [{ name: 'GitHub', url: '#' }, { name: 'Portfolio', url: '#' }]
      },
      'taylor-kim': {
        name: 'Taylor Kim',
        role: 'UX/UI Designer',
        department: 'Design',
        status: 'away',
        bio: 'Creative designer focused on user-centered experiences. Expert in design systems, accessibility standards, and creating intuitive interfaces that users love.',
        specializations: ['Design Systems', 'Accessibility Audits', 'User Research'],
        skills: ['Figma', 'UI/UX', 'Prototyping', 'Accessibility', 'Design Thinking'],
        projects: ['Design System v2', 'Mobile Redesign'],
        activity: ['Published accessibility checklist', 'Design critique session', 'Component library update'],
        links: [{ name: 'Behance', url: '#' }, { name: 'LinkedIn', url: '#' }]
      },
      'sam-rivera': {
        name: 'Sam Rivera',
        role: 'Cybersecurity Specialist',
        department: 'Security',
        status: 'online',
        bio: 'Security expert with focus on threat analysis and compliance. Certified ethical hacker and security trainer committed to protecting organizational assets.',
        specializations: ['Threat Analysis', 'Compliance', 'Risk Assessment'],
        skills: ['Security', 'Penetration Testing', 'Compliance', 'Incident Response'],
        projects: ['Security Audit', 'Compliance Framework'],
        activity: ['Completed security audit', 'Threat assessment report', 'Team training session'],
        links: [{ name: 'LinkedIn', url: '#' }]
      },
      'duncan-ojumbo': {
        name: 'Duncan Ojumbo',
        role: 'Software Developer',
        department: 'Engineering',
        status: 'online',
        bio: 'Passionate full-stack developer with expertise in modern JavaScript frameworks and backend systems. Active contributor to open-source projects and mentor to junior developers.',
        specializations: ['Backend Development', 'Database Design', 'DevOps'],
        skills: ['Python', 'TypeScript', 'Docker', 'Database Design', 'REST APIs'],
        projects: ['API Development', 'Database Optimization'],
        activity: ['Completed feature branch', 'Updated documentation', 'Pair programming session'],
        links: [{ name: 'GitHub', url: '#' }, { name: 'LinkedIn', url: '#' }]
      },
      'mary-marion': {
        name: 'Mary Marion',
        role: 'UX/UI Designer',
        department: 'Design',
        status: 'online',
        bio: 'Innovative UX/UI designer dedicated to crafting intuitive user experiences. Skilled in wireframing, prototyping, and user research to deliver impactful designs.',
        specializations: ['Wireframing', 'Prototyping', 'User Research'],
        skills: ['Adobe XD', 'User Research', 'Interaction Design', 'Visual Design'],
        projects: ['App Interface Design', 'User Testing'],
        activity: ['Conducted user interviews', 'Created wireframes for new app', 'Updated design guidelines'],
        links: [{ name: 'Behance', url: '#' }, { name: 'LinkedIn', url: '#' }]
      },
      'mark-benedict': {
        name: 'Mark Benedict',
        role: 'DevOps Engineer',
        department: 'Engineering',
        status: 'busy',
        bio: 'DevOps engineer focused on scalable infrastructure, CI/CD, and cloud operations. Experienced with Kubernetes and Terraform.',
        specializations: ['Kubernetes', 'CI/CD', 'Infrastructure as Code'],
        skills: ['Kubernetes', 'Terraform', 'CI/CD', 'Monitoring'],
        projects: ['Platform Automation', 'CI/CD Pipelines'],
        activity: ['Configured cluster autoscaling', 'Improved pipeline reliability', 'Rolled out monitoring updates'],
        links: [{ name: 'GitHub', url: '#' }, { name: 'LinkedIn', url: '#' }]
      }
    };

    function openMemberProfile(memberId, memberName, memberRole) {
  // Store currently viewed member for actions
  window.currentProfileMemberId = memberId;
  const data = teamMemberData[memberId] || {};
  document.getElementById('memberName').textContent = data.name || memberName || 'Unknown';
  document.getElementById('memberRole').textContent = data.role || memberRole || '';
  document.getElementById('memberDepartment').textContent = data.department || '';
  document.getElementById('memberBio').textContent = data.bio || '';
  document.getElementById('memberStatusText').textContent = (data.status || 'offline').charAt(0).toUpperCase() + (data.status || 'offline').slice(1);
  document.getElementById('memberStatusBadge').className = 'status-badge ' + (data.status || 'offline');
  document.getElementById('memberAvatar').src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.name || memberName) + '&background=0D8ABC&color=fff';
  
  // Specializations
  const specList = document.getElementById('memberSpecializations');
  specList.innerHTML = (data.specializations || []).map(function(s) { return '<span class="spec-tag">' + s + '</span>'; }).join('');
  
  // Skills
  const skillsDiv = document.getElementById('memberSkillsFull');
  skillsDiv.innerHTML = (data.skills || []).map(function(s) { return '<span class="skill-tag-large">' + s + '</span>'; }).join('');
  
  // Projects
  const projectsDiv = document.getElementById('memberProjects');
  projectsDiv.innerHTML = (data.projects || []).map(function(p) { return '<div class="project-item-card"><h5>' + p + '</h5><p>Active collaboration</p><span class="project-status-tag">In Progress</span></div>'; }).join('');
  
  // Activity
  const activityDiv = document.getElementById('memberActivity');
  activityDiv.innerHTML = (data.activity || []).map(function(a) { return '<div class="activity-item"><div class="activity-text">' + a + '</div><span class="activity-time">Recently</span></div>'; }).join('');
  // External Links
  const linksDiv = document.getElementById('memberExternalLinks');
  linksDiv.innerHTML = (data.links || []).map(function(l) { return '<a href="' + l.url + '" class="external-link" target="_blank">' + l.name + ' →</a>'; }).join('');
  
  // Attach handler: private chat and send message buttons
  setTimeout(function(){
    const privateBtn = document.getElementById('privateChatBtn');
    if (privateBtn) {
      privateBtn.onclick = function(){ startPrivateChat(memberId); };
    }
    const sendBtn = document.getElementById('sendMessageBtn');
    if (sendBtn) {
      sendBtn.onclick = function(){
        // Open team chat box and prefill mention
        const cb = document.getElementById('chatBox');
        if (cb) cb.classList.add('active');
        const input = document.getElementById('chatInput');
        if (input) { input.value = '@' + (data.name || memberName) + ' '; input.focus(); }
      };
    }
  }, 20);

    }

    // Toast notification function (top-level so other handlers can call it)
    function showToast(title, type = 'success', message = '') {
      let toastContainer = document.getElementById('toastContainer');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        document.body.appendChild(toastContainer);
      }
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
      setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // Function to send message to AI API
    async function getAIResponse(message) {
      // Attach a user identifier when possible so server-side dedupe works per user
      const savedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      const userId = savedUser?.id || savedUser?.identifier || 'guest';

      // First try to connect to the backend API
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message, userId }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          if (data.sources && data.sources.length > 0) {
            const srcText = `\n\nSources: ${data.sources.map(s => s.title).join(', ')}`;
            return `${data.response}${srcText}`;
          }
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
    
    // Send chat message (top-level so key handlers can call it)
    async function sendMessage() {
      const input = document.getElementById('chatInput');
      if (!input) return;
      const message = input.value.trim();
      if (!message) return;
      const messagesContainer = document.getElementById('chatMessages');
      if (!messagesContainer) return;
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
      typingIndicator.innerHTML = `<div>🤖 Thinking...</div>`;
      messagesContainer.appendChild(typingIndicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // Get AI response
      const response = await getAIResponse(message);
      
      // Remove typing indicator
      const typingEl = document.getElementById('typing-indicator');
      if (typingEl) typingEl.remove();
      
      // Add bot response
      const botMsg = document.createElement('div');
      botMsg.className = 'message bot';
      botMsg.innerHTML = `<div>${response}</div>`;
      messagesContainer.appendChild(botMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Duplicate AI handlers removed (kept the first definitions earlier in the file).

    document.addEventListener('DOMContentLoaded', function() {
      // Set active nav button
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      const teamNavBtn = document.querySelector('.nav-btn[data-section="team"]');
      if (teamNavBtn) teamNavBtn.classList.add('active');
      
      // Initialize user initial
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {name: 'User', initial: 'U', role: 'Project Member'};
      document.getElementById('userInitial').textContent = currentUser.initial;
      // set role selector (if present)
      const roleSel = document.getElementById('roleSelect'); if (roleSel) { roleSel.value = currentUser.role || 'Project Member'; }
      
      // Use event delegation for all interactive elements
      document.addEventListener('click', function(e) {
        // Member card clicks - open profile modal
        if (e.target.closest('.member-card') && !e.target.closest('.msg-btn') && !e.target.closest('.schedule-btn')) {
          const card = e.target.closest('.member-card');
          const memberId = card.dataset.memberId;
          const memberName = card.dataset.memberName;
          const memberRole = card.dataset.memberRole;
          openMemberProfile(memberId, memberName, memberRole);
        }
        
        // Message buttons
        if (e.target.closest('.msg-btn')) {
          const card = e.target.closest('.member-card');
          showToast('Messaging', 'info', `Opening chat with ${card.dataset.memberName}...`);
        }
        
        // Schedule meeting buttons
        if (e.target.closest('.schedule-btn')) {
          const card = e.target.closest('.member-card');
          showToast('Scheduling', 'info', `Scheduling meeting with ${card.dataset.memberName}...`);
        }

        // Profile avatar - redirect to main page to open profile modal
        if (e.target.closest('#profileBtn')) {
          window.location.href = 'index.html#openProfile';
        }

        // Theme toggle
        if (e.target.closest('#themeToggle')) {
          const currentTheme = document.body.getAttribute('data-theme') || 'dark';
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          document.body.setAttribute('data-theme', newTheme);
          localStorage.setItem('theme', newTheme);
          showToast('Theme Changed', 'info', `Switched to ${newTheme} mode`);
          
          // Update theme across all open tabs/windows
          localStorage.setItem('themeBroadcast', JSON.stringify({
            theme: newTheme,
            timestamp: Date.now()
          }));
        }

        // Notification button
        if (e.target.closest('#notificationBtn')) {
          const np = document.getElementById('notificationsPanel');
          if (np) np.classList.add('active');
        }

        // Profile modal events
        if (e.target.closest('#profileBtn')) {
          // Check if currentUser exists
          const currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
          if (!currentUser) {
            showToast('Please sign in to view your profile', 'warning');
            // Redirect to index.html to open profile
            window.location.href = 'index.html#openProfile';
            return;
          }
          
          // Set profile data
          document.getElementById('profileName').value = currentUser.name || 'User';
          document.getElementById('profileEmail').value = currentUser.email || '';
          document.getElementById('profileRole').value = currentUser.role || 'Team Member';
          
          // Load profile picture if exists
          const savedProfilePic = localStorage.getItem('profilePicture');
          if (savedProfilePic) {
            document.getElementById('profilePicture').src = savedProfilePic;
          } else {
            document.getElementById('profilePicture').src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name || 'User') + '&background=0D8ABC&color=fff';
          }
          
          document.getElementById('profileModal').classList.add('active');
        }
        
        // Close profile modal
        if (e.target.id === 'closeProfile' || e.target.id === 'cancelProfile') {
          document.getElementById('profileModal').classList.remove('active');
        }
        
        // Save profile
        if (e.target.id === 'saveProfile') {
          const fullName = document.getElementById('profileName').value;
          const email = document.getElementById('profileEmail').value;
          const role = document.getElementById('profileRole').value;
          
          // Update currentUser in localStorage
          let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
          currentUser.name = fullName;
          currentUser.email = email;
          currentUser.role = role;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          
          // Update profile picture if it exists
          const profilePicSrc = document.getElementById('profilePicture').src;
          if (profilePicSrc) {
            localStorage.setItem('profilePicture', profilePicSrc);
          }
          
          // Update user initial in header
          document.getElementById('userInitial').textContent = fullName.charAt(0).toUpperCase();
          
          document.getElementById('profileModal').classList.remove('active');
          showToast('Profile Updated', 'success', 'Your profile has been updated successfully!');
        }
        
        // Logout button
        if (e.target.id === 'logoutBtn') {
          if (confirm('Are you sure you want to log out?')) {
            // Clear user data from localStorage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('profilePicture');
            
            // Reset current user variable
            currentUser = null;
            
            // Update UI
            document.getElementById('userInitial').textContent = 'U';
            document.getElementById('profileModal').classList.remove('active');
            
            // Redirect to home page
            window.location.href = 'index.html';
            
            showToast('Logged Out', 'info', 'You have been successfully logged out');
          }
        }
        
        // Delete account button
        if (e.target.id === 'deleteAccountBtn') {
          if (confirm('⚠️ DANGER ZONE ⚠️\n\nAre you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.')) {
            if (confirm('Final confirmation: Do you really want to delete your account? This cannot be reversed.')) {
              // Clear all user data from localStorage
              localStorage.removeItem('currentUser');
              localStorage.removeItem('profilePicture');
              
              // Reset current user variable
              currentUser = null;
              
              // Update UI
              document.getElementById('userInitial').textContent = 'U';
              document.getElementById('profileModal').classList.remove('active');
              
              // Redirect to home page
              window.location.href = 'index.html';
              
              showToast('Account Deleted', 'warning', 'Your account has been permanently deleted');
            }
          }
        }
        
        // Deactivate account button
        if (e.target.id === 'deactivateAccountBtn') {
          if (confirm('Are you sure you want to deactivate your account? You will be able to reactivate it later by logging in again.')) {
            // In a real app, this would mark the account as deactivated
            // For this demo, we'll just log out but preserve the account data
            
            // Update user status to deactivated
            let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
            currentUser.deactivated = true;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update UI
            document.getElementById('userInitial').textContent = 'U';
            document.getElementById('profileModal').classList.remove('active');
            
            // Redirect to home page
            window.location.href = 'index.html';
            
            showToast('Account Deactivated', 'info', 'Your account has been deactivated. You can reactivate it by logging in again.');
          }
        }
        
        // Edit profile picture
        if (e.target.id === 'editProfilePicBtn') {
          // Show options to change or remove picture
          if (confirm('Would you like to upload a new picture? Click OK to upload or Cancel to remove current picture.')) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = function(e) {
              if (this.files && this.files[0]) {
                const file = this.files[0];
                
                // Check if file is an image
                if (!file.type.match('image.*')) {
                  showToast('Invalid File Type', 'error', 'Please select an image file');
                  return;
                }
                
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                  showToast('File Too Large', 'error', 'Please select an image smaller than 5MB');
                  return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                  document.getElementById('profilePicture').src = e.target.result;
                  // Save to localStorage
                  localStorage.setItem('profilePicture', e.target.result);
                  showToast('Profile Picture Updated', 'success', 'Your profile picture has been updated');
                }
                reader.readAsDataURL(file);
              }
            };
            input.click();
          } else {
            // Remove current picture
            const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {name: 'User'};
            document.getElementById('profilePicture').src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name) + '&background=0D8ABC&color=fff';
            localStorage.removeItem('profilePicture');
            showToast('Profile Picture Removed', 'success', 'Your profile picture has been removed');
          }
        }

        // Close team member modal
        if (e.target.id === 'closeTeamModal' || e.target.id === 'backToTeamBtn') {
          const modal = document.getElementById('teamMemberModal');
          if (modal) modal.classList.remove('active');
        }
        
        // Close notifications panel
        if (e.target.id === 'closeNotifications') {
          const np = document.getElementById('notificationsPanel');
          if (np) np.classList.remove('active');
        }
        
        // Close chat box
        if (e.target.id === 'closeChat') {
          const cb = document.getElementById('chatBox');
          if (cb) cb.classList.remove('active');
        }
        
        // Chat send button
        if (e.target.id === 'chatSend') {
          sendMessage();
        }

        // Collaboration actions in modal
        if (e.target.id === 'sendMessageBtn') {
          // Open messaging interface
          showToast('Message', 'info', 'Opening messaging interface...');
          // In a real app, this would open a chat with the specific team member
          // For now, we'll just show a message
          const memberName = document.getElementById('memberName').textContent;
          showToast('Messaging ' + memberName, 'info', 'Opening chat with ' + memberName + '...');
        }
        if (e.target.id === 'scheduleMeetingBtn') {
          // Open calendar interface
          showToast('Meeting', 'info', 'Opening calendar...');
          // In a real app, this would open a scheduling interface
          const memberName = document.getElementById('memberName').textContent;
          showToast('Scheduling Meeting', 'info', 'Opening calendar to schedule meeting with ' + memberName + '...');
        }
        if (e.target.id === 'requestReviewBtn') {
          // Open review request form
          showToast('Request', 'info', 'Creating review request form...');
          // In a real app, this would open a form to request a review
          const memberName = document.getElementById('memberName').textContent;
          showToast('Request Review', 'info', 'Creating review request for ' + memberName + '...');
        }
        if (e.target.id === 'shareProfileBtn') {
          // Copy profile link to clipboard
          const profileUrl = window.location.href.split('#')[0] + '#team-member-' + document.querySelector('.profile-avatar-lg img').alt.toLowerCase().replace(' ', '-');
          navigator.clipboard.writeText(profileUrl).then(() => {
            showToast('Share', 'success', 'Profile link copied to clipboard!');
          }).catch(err => {
            showToast('Share', 'error', 'Failed to copy link');
          });
        }
      });
      // Load theme preference
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.body.setAttribute('data-theme', savedTheme);
      
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
    });

    // Add event listener for Enter key in chat input (global)
    document.addEventListener('keydown', function(e) {
      if (e.target && e.target.id === 'chatInput' && e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });

    // ===== Project features implementation =====
    function getCurrentUser() {
      return JSON.parse(localStorage.getItem('currentUser') || JSON.stringify({ id:'taylor', name:'Taylor Kim', role:'Project Member', roles:['Project Member'], initial:'T', email:'taylor@example.com' }));
    }

    const PERMISSIONS = {
      postUpdate: ['Project Member','Team Lead','Project Manager','Admin'],
      editProject: ['Project Manager','Admin'],
      exportReport: ['Project Manager','Admin','Client'],
      addTask: ['Team Lead','Project Manager','Admin'],
      uploadDocument: ['Project Member','Team Lead','Project Manager','Admin'],
      newThread: ['Project Member','Team Lead','Project Manager','Admin','Client'],
      exportData: ['Project Manager','Admin'],
      updateReport: ['Project Manager','Admin'],
      attachFile: ['Project Member','Team Lead','Project Manager','Admin','Client']
    };
    function hasPermission(action) { const u = getCurrentUser(); return u && (PERMISSIONS[action]||[]).includes(u.role); }

    function getProjectStore() { return JSON.parse(localStorage.getItem('demoProjectStore') || '{}'); }
    function setProjectStore(s) { localStorage.setItem('demoProjectStore', JSON.stringify(s)); }

    // ensure base project exists
    (function(){ const s = getProjectStore(); if (!s.project) { s.project = { id:'proj-1', name:'Project Alpha', description:'Demo project', deadline:'2026-06-30', budget:100000, status:'In Progress', members:['taylor'], tasks:[], files:[], feed:[], threads:[], audit:[], reports:[] }; setProjectStore(s); } })();

    function broadcastEvent(event) { localStorage.setItem('demoProjectBroadcast', JSON.stringify({ event, ts:Date.now() })); }

    window.addEventListener('storage', function(e){ if (e.key === 'demoProjectBroadcast' && e.newValue) { try { const p = JSON.parse(e.newValue); if (p.event.type === 'newPost') renderSinglePost(p.event.post, true); if (p.event.type === 'updateProject') applyProjectChanges(p.event.updates); } catch(err){} } });

    function renderFeed() {
      const s = getProjectStore(); const feed = (s.project && s.project.feed) || []; const container = document.getElementById('projectFeed'); if (!container) return; container.innerHTML = ''; feed.slice().reverse().forEach(p=>renderSinglePost(p));
    }

    function formatTime(ts) { return new Date(ts).toLocaleString(); }

    function escapeHtml(str){ return (''+str).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]; }); }

    function renderSinglePost(post, prepend=false) {
      const container = document.getElementById('projectFeed'); if (!container) return; if (document.getElementById('post-'+post.id)) return; const el = document.createElement('div'); el.className='project-post'; el.id='post-'+post.id; el.innerHTML = `
        <div class="post-header">
          <img class="post-avatar" src="https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=555&color=fff" alt="${post.author.name}">
          <div class="post-meta">
            <div class="post-author">${post.author.name} <span class="post-role">${post.author.role}</span></div>
            <div class="post-time">${formatTime(post.ts)}</div>
          </div>
        </div>
        <div class="post-body">${escapeHtml(post.content||'')}</div>
        <div class="post-attachments">${(post.attachments||[]).map(a=>`<div class="attach-item"><a href="${a.url}" download>${a.name}</a></div>`).join('')}</div>
        <div class="post-actions">
          <button class="btn-link like-btn" data-id="${post.id}">❤️ <span class="like-count">${post.likes||0}</span></button>
          <button class="btn-link reply-btn" data-id="${post.id}">Reply</button>
        </div>
        <div class="post-replies" id="replies-${post.id}">${(post.replies||[]).map(r=>`<div class="reply"><strong>${r.author.name}:</strong> ${escapeHtml(r.text)}</div>`).join('')}</div>`;
      if (prepend) container.prepend(el); else container.appendChild(el);
    }

    function postUpdate(content, attachments){ const s = getProjectStore(); const user = getCurrentUser(); const id = 'p-'+Date.now(); const post = { id, content, attachments:attachments||[], author:{ id:user.id, name:user.name, role:user.role }, ts:Date.now(), likes:0, replies:[] }; s.project.feed = s.project.feed||[]; s.project.feed.push(post); s.project.audit = s.project.audit||[]; s.project.audit.push({ action:'post', by:user.id, at:Date.now(), details:content.slice(0,120) }); setProjectStore(s); renderSinglePost(post, true); broadcastEvent({ type:'newPost', post }); showToast('Post published','success','Update shared to project feed'); addNotificationForMembers(post); }

    function addNotificationForMembers(post) { const np = document.querySelector('.notifications-list'); if (np) { const item = document.createElement('div'); item.className='notification-item'; item.innerHTML = `<div class="notification-icon">💬</div><div class="notification-content"><h4>Project Update</h4><p>${post.author.name} posted an update</p><span class="notification-time">Now</span></div>`; np.prepend(item); } console.log('Simulated email notifications to project members'); }

    function handlePostButton(){ const input = document.getElementById('postInput'); const attach = document.getElementById('postAttach'); const btn = document.getElementById('postButton'); if (!input) return; const val = input.value.trim(); if (!val) { input.classList.add('input-warning'); setTimeout(()=>input.classList.remove('input-warning'),1500); return; } if (!hasPermission('postUpdate')) { showToast('Permission denied','error','You cannot post updates'); return; } btn.disabled=true; btn.classList.add('loading'); const attachments=[]; if (attach && attach.files && attach.files.length){ Array.from(attach.files).forEach(f=>{ const fileObj={ name:f.name, url:URL.createObjectURL(f), size:f.size }; attachments.push(fileObj); const s = getProjectStore(); s.project.files = s.project.files||[]; s.project.files.push({ id:'f-'+Date.now(), name:f.name, uploadedBy:getCurrentUser().id, url:fileObj.url, ts:Date.now(), version:1 }); setProjectStore(s); }); attach.value=''; }
      setTimeout(()=>{ postUpdate(val, attachments); input.classList.add('clearing'); setTimeout(()=>{ input.value=''; input.classList.remove('clearing'); },300); btn.disabled=false; btn.classList.remove('loading'); },700);
    }

    // wire composer & attach
    document.addEventListener('DOMContentLoaded', function(){
      const postBtn = document.getElementById('postButton'); if (postBtn) postBtn.addEventListener('click', handlePostButton);
      const attachBtn = document.getElementById('attachButton'); if (attachBtn) attachBtn.addEventListener('click', ()=>document.getElementById('postAttach').click());
      const attachInput = document.getElementById('postAttach'); if (attachInput) attachInput.addEventListener('change', function(){ const preview = document.getElementById('attachPreview'); preview.innerHTML=''; Array.from(this.files||[]).forEach(f=>{ const d=document.createElement('div'); d.className='attach-preview-item'; d.textContent=f.name; preview.appendChild(d); }); });

      // hide buttons if user lacks permissions
      if (!hasPermission('editProject')) { const b = document.getElementById('openEditProject'); if (b) b.style.display='none'; }
      if (!hasPermission('exportReport')) { const b = document.getElementById('exportReportBtn'); if (b) b.style.display='none'; }
      if (!hasPermission('addTask')) { const b = document.getElementById('addTaskBtn'); if (b) b.style.display='none'; }
      if (!hasPermission('uploadDocument')) { const b = document.getElementById('uploadDocBtn'); if (b) b.style.display='none'; }
      if (!hasPermission('exportData')) { const b = document.getElementById('exportDataBtn'); if (b) b.style.display='none'; }
      if (!hasPermission('updateReport')) { const b = document.getElementById('updateReportBtn'); if (b) b.style.display='none'; }

      // open edit & export & add task modals
      const openEdit = document.getElementById('openEditProject'); if (openEdit) openEdit.addEventListener('click', function(){ if (!hasPermission('editProject')) { showToast('Permission denied','error'); return; } document.getElementById('editProjectModal').classList.add('active'); const s = getProjectStore(); const p=s.project||{}; document.getElementById('projName').value = p.name||''; document.getElementById('projDesc').value = p.description||''; document.getElementById('projDeadline').value = p.deadline||''; document.getElementById('projBudget').value = p.budget||''; });
      const exportBtn = document.getElementById('exportReportBtn'); if (exportBtn) exportBtn.addEventListener('click', function(){ if (!hasPermission('exportReport')) { showToast('Permission denied','error'); return; } document.getElementById('exportModal').classList.add('active'); });
      const addTaskBtn = document.getElementById('addTaskBtn'); if (addTaskBtn) addTaskBtn.addEventListener('click', function(){ if (!hasPermission('addTask')) { showToast('Permission denied','error'); return; } document.getElementById('addTaskModal').classList.add('active'); });
      const newThreadBtn = document.getElementById('createThreadBtn'); if (newThreadBtn) newThreadBtn.addEventListener('click', function(){ if (!hasPermission('newThread')) { showToast('Permission denied','error'); return; } document.getElementById('newThreadModal').classList.add('active'); });
      const exportDataBtn = document.getElementById('exportDataBtn'); if (exportDataBtn) exportDataBtn.addEventListener('click', function(){ if (!hasPermission('exportData')) { showToast('Permission denied','error'); return; } exportData(); });
      const updateReportBtn = document.getElementById('updateReportBtn'); if (updateReportBtn) updateReportBtn.addEventListener('click', updateReport);

      // close modals
      document.querySelectorAll('.modal .close-modal').forEach(b=>b.addEventListener('click', function(){ const id = this.dataset.close; if (id) document.getElementById(id).classList.remove('active'); }));

      // save edits
      document.getElementById('saveProjectEdits') && document.getElementById('saveProjectEdits').addEventListener('click', function(){ const s = getProjectStore(); const p = s.project||{}; const updates = { name: document.getElementById('projName').value.trim(), description: document.getElementById('projDesc').value.trim(), deadline: document.getElementById('projDeadline').value, budget: Number(document.getElementById('projBudget').value) || 0 }; s.project = Object.assign({}, p, updates); s.project.audit = s.project.audit||[]; s.project.audit.push({ action:'editProject', by:getCurrentUser().id, at:Date.now(), details:JSON.stringify(updates) }); setProjectStore(s); broadcastEvent({ type:'updateProject', updates }); document.getElementById('editProjectModal').classList.remove('active'); showToast('Project saved','success'); });

      // create task
      document.querySelector('#addTaskModal button.btn-primary') && document.querySelector('#addTaskModal button.btn-primary').addEventListener('click', function(){ const m=document.getElementById('addTaskModal'); const title=m.querySelector('#taskTitle').value.trim(); if (!title) { m.querySelector('#taskTitle').classList.add('input-warning'); setTimeout(()=>m.querySelector('#taskTitle').classList.remove('input-warning'),1500); return; } const task={ id:'t-'+Date.now(), title, description:m.querySelector('#taskDesc').value.trim(), priority:m.querySelector('#taskPriority').value, assignee:m.querySelector('#taskAssignee').value, deadline:m.querySelector('#taskDeadline').value, status:'open', createdBy:getCurrentUser().id, ts:Date.now() }; const s=getProjectStore(); s.project.tasks=s.project.tasks||[]; s.project.tasks.push(task); s.project.audit=s.project.audit||[]; s.project.audit.push({ action:'addTask', by:getCurrentUser().id, at:Date.now(), details:task.title }); setProjectStore(s); document.getElementById('addTaskModal').classList.remove('active'); showToast('Task created','success',`Task "${task.title}" added`); updateReport(); });

      // create thread
      document.querySelector('#newThreadModal button.btn-primary') && document.querySelector('#newThreadModal button.btn-primary').addEventListener('click', function(){ const m=document.getElementById('newThreadModal'); const title=m.querySelector('#threadTitle').value.trim(); const body=m.querySelector('#threadBody').value.trim(); if (!title || !body) { showToast('Validation','warning','Please provide title and message'); return; } const s=getProjectStore(); s.project.threads = s.project.threads||[]; s.project.threads.push({ id:'th-'+Date.now(), title, body, author:getCurrentUser(), ts:Date.now(), replies:[] }); s.project.audit = s.project.audit||[]; s.project.audit.push({ action:'newThread', by:getCurrentUser().id, at:Date.now(), details:title }); setProjectStore(s); document.getElementById('newThreadModal').classList.remove('active'); showToast('Thread','success','Thread created'); });

      // export generator
      window.generateReport = function(format){ const s=getProjectStore(); const project=s.project||{}; const ts = new Date().toISOString().replace(/[:.]/g,'-'); let content='', mime='text/plain'; let ext = format; if (format==='excel') ext='xlsx'; const filename = `${project.name.replace(/\s+/g,'-')}-report-${ts}.${ext}`; if (format==='pdf') { mime='application/pdf'; content = 'Report - '+project.name+'\nGenerated: '+new Date().toLocaleString()+'\n\n'+(project.description || ''); } else { mime='text/csv'; content = 'Section,Value\nName,"'+project.name+'"\nStatus,'+project.status+'\nBudget,'+project.budget; } const blob = new Blob([content], { type:mime }); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); s.project.reports=s.project.reports||[]; s.project.reports.push({ id:'r-'+Date.now(), format, ts:Date.now(), filename }); setProjectStore(s); document.getElementById('exportModal').classList.remove('active'); showToast('Exported','success',`Downloaded ${filename}`); };

      // export data
      window.exportData = function(){ const s=getProjectStore(); const data={ tasks:s.project.tasks||[], budget:{budget:s.project.budget}, timeLogs:[] }; const blob=new Blob([JSON.stringify(data,null,2)],{ type:'application/json' }); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${s.project.name}-raw-data-${Date.now()}.json`; document.body.appendChild(a); a.click(); a.remove(); showToast('Exported','success','Raw project data downloaded'); };

      // save new task (global for inline onclick)
      window.saveNewTask = function(){ const m=document.getElementById('addTaskModal'); const title = m.querySelector('#taskTitle').value.trim(); if (!title) { m.querySelector('#taskTitle').classList.add('input-warning'); setTimeout(()=>m.querySelector('#taskTitle').classList.remove('input-warning'),1500); return; } const task = { id:'t-'+Date.now(), title, description:m.querySelector('#taskDesc').value.trim(), priority:m.querySelector('#taskPriority').value, assignee:m.querySelector('#taskAssignee').value, deadline:m.querySelector('#taskDeadline').value, status:'open', createdBy:getCurrentUser().id, ts:Date.now() }; const s = getProjectStore(); s.project.tasks = s.project.tasks||[]; s.project.tasks.push(task); s.project.audit = s.project.audit||[]; s.project.audit.push({ action:'addTask', by:getCurrentUser().id, at:Date.now(), details:task.title }); setProjectStore(s); document.getElementById('addTaskModal').classList.remove('active'); showToast('Task added','success',`Task "${task.title}" created`); updateReport(); };

      // save new thread (global for inline onclick)
      window.saveNewThread = function(){ const m = document.getElementById('newThreadModal'); const title = m.querySelector('#threadTitle').value.trim(); const body = m.querySelector('#threadBody').value.trim(); if (!title || !body) { showToast('Validation','warning','Please provide title and message'); return; } const s = getProjectStore(); s.project.threads = s.project.threads||[]; s.project.threads.push({ id:'th-'+Date.now(), title, body, author:getCurrentUser(), ts:Date.now(), replies:[] }); s.project.audit = s.project.audit||[]; s.project.audit.push({ action:'newThread', by:getCurrentUser().id, at:Date.now(), details:title }); setProjectStore(s); document.getElementById('newThreadModal').classList.remove('active'); showToast('Thread created','success','Your thread has been created'); };

      // update report
      window.updateReport = function(){ const s=getProjectStore(); const tasks=s.project.tasks||[]; const total = tasks.length; const done = tasks.filter(t=>t.status==='done').length; const percent = total ? Math.round((done/total)*100) : 0; s.project.metrics = { totalTasks: total, done, completionPercent: percent }; s.project.audit=s.project.audit||[]; s.project.audit.push({ action:'updateReport', by:getCurrentUser().id, at:Date.now(), details:JSON.stringify(s.project.metrics) }); setProjectStore(s); const kpi=document.getElementById('projectCompletionPercent'); if (kpi) kpi.textContent = percent+'%'; showToast('Report updated','success','Project metrics refreshed'); };

      // like & reply via delegation
      document.addEventListener('click', function(e){ if (e.target.closest('.like-btn')) { const id = e.target.closest('.like-btn').dataset.id; const s=getProjectStore(); const post = (s.project.feed||[]).find(p=>p.id===id); if (!post) return; post.likes = (post.likes||0)+1; setProjectStore(s); const el = document.querySelector(`#post-${id} .like-count`); if (el) el.textContent = post.likes; s.project.audit = s.project.audit||[]; s.project.audit.push({ action:'like', by:getCurrentUser().id, at:Date.now(), details:id }); } if (e.target.closest('.reply-btn')) { const id = e.target.closest('.reply-btn').dataset.id; const repliesEl = document.getElementById('replies-'+id); if (!repliesEl) return; if (document.getElementById('reply-box-'+id)) return; const box=document.createElement('div'); box.className='reply-box'; box.id='reply-box-'+id; box.innerHTML = `<input placeholder="Write a reply..." class="reply-input" id="reply-input-${id}"><button class="btn-primary" id="reply-send-${id}">Send</button>`; repliesEl.appendChild(box); document.getElementById('reply-send-'+id).addEventListener('click', function(){ const val=document.getElementById('reply-input-'+id).value.trim(); if (!val) return; const s=getProjectStore(); const post=(s.project.feed||[]).find(p=>p.id===id); if (!post) return; const reply={ text:val, author:{ id:getCurrentUser().id, name:getCurrentUser().name }, ts:Date.now() }; post.replies = post.replies||[]; post.replies.push(reply); setProjectStore(s); const replyEl=document.createElement('div'); replyEl.className='reply'; replyEl.innerHTML=`<strong>${reply.author.name}:</strong> ${escapeHtml(reply.text)}`; repliesEl.appendChild(replyEl); box.remove(); }); } });

      // upload document handler - support project page file upload modal when present
      const uploadDocBtn = document.getElementById('uploadDocBtn');
      if (uploadDocBtn) {
        uploadDocBtn.addEventListener('click', function(){
          const modal = document.getElementById('fileUploadModal');
          if (modal) return modal.classList.add('active');
          const hidden = document.getElementById('uploadDocInput');
          if (hidden) hidden.click();
        });
      }

      const uploadFilesBtn = document.getElementById('uploadFiles');
      if (uploadFilesBtn) {
        uploadFilesBtn.addEventListener('click', function(){
          const fileInput = document.getElementById('fileInput') || document.getElementById('uploadDocInput');
          if (!fileInput || !fileInput.files || !fileInput.files.length) { showToast('No Files Selected','error','Please select files to upload'); return; }
          Array.from(fileInput.files).forEach(f=>{
            showToast('Scanning file','info', `Scanning ${f.name}...`);
            setTimeout(()=>{
              const s = getProjectStore(); s.project.files = s.project.files||[]; s.project.files.push({ id:'f-'+Date.now(), name:f.name, uploadedBy:getCurrentUser().id, url:URL.createObjectURL(f), ts:Date.now(), version:1 }); setProjectStore(s);
              showToast('Uploaded','success', `${f.name} uploaded and attached to project`);
              const docGrid = document.querySelector('.documents-grid');
              if (docGrid) {
                const card = document.createElement('div'); card.className='document-card'; card.innerHTML = `<div class="doc-icon">📄</div><div class="doc-info"><h4>${f.name}</h4><p>Uploaded just now</p></div><div class="doc-actions"><button class="icon-btn small" title="Download">⬇</button><button class="icon-btn small" title="Delete">🗑</button></div>`; docGrid.prepend(card);
              }
            }, 800);
          });
          if (document.getElementById('fileUploadModal')) document.getElementById('fileUploadModal').classList.remove('active');
          if (fileInput) fileInput.value='';
          const uploadedFiles = document.getElementById('uploadedFiles'); if (uploadedFiles) uploadedFiles.innerHTML='';
        });
      }



      // initial render
      renderFeed(); updateReport();
    });
    
    // Manager permissions
    const MANAGER_PERMISSIONS = {
      editAnyContent: ['Project Manager','Admin'],
      addAnyContent: ['Project Manager','Admin'],
      removeAnyContent: ['Project Manager','Admin'],
      editRole: ['Project Manager']
    };
    
    // Check if user has permission for an action
    function hasManagerPermission(action) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {name: 'User', initial: 'U', role: 'Project Member'};
      return currentUser.role && (MANAGER_PERMISSIONS[action] || []).includes(currentUser.role);
    }
    
    // Manager editing functionality
    function enableManagerEditing() {
      if (!hasManagerPermission('editAnyContent')) return;
      
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
        '.team-member, .member-card, .service-card, .stat-card, .culture-card, .achievement-card'
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
      if (!hasManagerPermission('editAnyContent')) return;
      
      const draggables = document.querySelectorAll('.member-card, .service-card, .stat-card, .culture-card, .achievement-card');
      const containers = document.querySelectorAll('.team-grid, .services-grid, .stats-grid, .culture-grid, .achievements-grid');
      
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
      const draggableElements = [...container.querySelectorAll('.member-card:not(.dragging), .service-card:not(.dragging), .stat-card:not(.dragging), .culture-card:not(.dragging), .achievement-card:not(.dragging)')];
      
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
      if (!hasManagerPermission('editAnyContent')) return;
      
      document.addEventListener('contextmenu', function(e) {
        // Check if we're on content that can be managed
        const contentElement = e.target.closest('.team-member, .member-card, .service-card, .stat-card, .culture-card, .achievement-card');
        
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
      if (hasManagerPermission('editAnyContent')) {
        addEditButtonsToContent();
      }
      
      showToast('Content Duplicated', 'success', 'Content has been duplicated');
    }
    
    // Add manager toolbar
    function addManagerToolbar() {
      if (!hasManagerPermission('addAnyContent')) return;
      
      // Create toolbar
      let toolbar = document.getElementById('managerToolbar');
      if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'managerToolbar';
        toolbar.innerHTML = `
          <div class="toolbar-btn" title="Add New Member" id="addNewMember">➕ Member</div>
          <div class="toolbar-btn" title="Add New Card" id="addNewCard">➕ Card</div>
          <div class="toolbar-btn" title="Add New Section" id="addNewSection">➕ Section</div>
          <div class="toolbar-btn" title="Add New Feature" id="addNewFeature">➕ Feature</div>
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
      document.getElementById('addNewMember').onclick = function() {
        addNewMember();
      };
      
      document.getElementById('addNewCard').onclick = function() {
        addNewCard();
      };
      
      document.getElementById('addNewSection').onclick = function() {
        addNewSection();
      };
      
      document.getElementById('addNewFeature').onclick = function() {
        addNewFeature();
      };
    }
    
    // Add new member
    function addNewMember() {
      const memberName = prompt('Enter member name:');
      if (memberName) {
        // Find the team grid or create one
        let teamGrid = document.querySelector('.team-grid');
        if (!teamGrid) {
          const teamSection = document.createElement('div');
          teamSection.className = 'team-section';
          teamSection.innerHTML = `
            <div class="section-header">
              <h2 class="section-title">Our Team</h2>
            </div>
            <div class="team-grid"></div>
          `;
          document.body.appendChild(teamSection);
          teamGrid = document.querySelector('.team-grid');
        }
        
        const newMember = document.createElement('div');
        newMember.className = 'member-card';
        newMember.innerHTML = `
          <div class="member-avatar">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=0D8ABC&color=fff" alt="${memberName}">
            <div class="status-badge online"></div>
          </div>
          <div class="member-info">
            <h3>${memberName}</h3>
            <p class="member-role">New Team Member</p>
          </div>
          <div class="member-actions">
            <button class="msg-btn">Message</button>
            <button class="schedule-btn">Schedule</button>
          </div>
        `;
        teamGrid.appendChild(newMember);
        
        // Add manager controls to the new member
        if (hasManagerPermission('editAnyContent')) {
          addEditButtonsToContent();
        }
        
        showToast('Member Added', 'success', 'New team member has been added');
      }
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
    
    // Add new card
    function addNewCard() {
      const cardTitle = prompt('Enter card title:');
      if (cardTitle) {
        // Find a grid container or create one
        let grid = document.querySelector('.team-grid, .services-grid, .stats-grid, .culture-grid, .achievements-grid');
        if (!grid) {
          const gridSection = document.createElement('div');
          gridSection.className = 'content-grid';
          gridSection.innerHTML = '<div class="team-grid"></div>';
          document.body.appendChild(gridSection);
          grid = document.querySelector('.team-grid');
        }
        
        const newCard = document.createElement('div');
        newCard.className = 'member-card';
        newCard.innerHTML = `
          <div class="card-icon">👤</div>
          <h3>${cardTitle}</h3>
          <p>New card content...</p>
        `;
        grid.appendChild(newCard);
        
        // Add manager controls to the new card
        if (hasManagerPermission('editAnyContent')) {
          addEditButtonsToContent();
        }
        
        showToast('Card Added', 'success', 'New card has been added');
      }
    }
    
    // Add new feature
    function addNewFeature() {
      const featureTitle = prompt('Enter feature title:');
      if (featureTitle) {
        // Find the services section or create one
        let servicesSection = document.querySelector('.services-section');
        if (!servicesSection) {
          servicesSection = document.createElement('div');
          servicesSection.className = 'services-section';
          servicesSection.innerHTML = `
            <div class="section-header">
              <h2 class="section-title">Our Services</h2>
            </div>
            <div class="services-grid"></div>
          `;
          document.body.appendChild(servicesSection);
        }
        
        const servicesGrid = servicesSection.querySelector('.services-grid');
        const newFeature = document.createElement('div');
        newFeature.className = 'service-card';
        newFeature.innerHTML = `
          <div class="card-icon">✨</div>
          <h3>${featureTitle}</h3>
          <p>New feature description...</p>
        `;
        servicesGrid.appendChild(newFeature);
        
        // Add manager controls to the new feature
        if (hasManagerPermission('editAnyContent')) {
          addEditButtonsToContent();
        }
        
        showToast('Feature Added', 'success', 'New feature has been added');
      }
    }
    
    // Apply manager functionality on page load
    function applyManagerFeatures() {
      if (hasManagerPermission('editAnyContent')) {
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
    
    // Apply manager features when page loads
    applyManagerFeatures();

    // ------------------------
    // Private E2E Chat (client-side crypto)
    // ------------------------

    // Utility: base64 helpers
    function arrayBufferToBase64(buffer) {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    }
    function base64ToArrayBuffer(base64) {
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      return bytes.buffer;
    }

    // Crypto helpers (ECDH P-256)
    async function generateECDHKeyPair() {
      const kp = await window.crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']);
      return kp;
    }

    async function exportPublicKeyBase64(publicKey) {
      const raw = await window.crypto.subtle.exportKey('raw', publicKey);
      return arrayBufferToBase64(raw);
    }

    async function importPublicKeyBase64(base64) {
      const raw = base64ToArrayBuffer(base64);
      return await window.crypto.subtle.importKey('raw', raw, { name: 'ECDH', namedCurve: 'P-256' }, true, []);
    }

    async function deriveAESKey(privateKey, publicKey) {
      return await window.crypto.subtle.deriveKey(
        { name: 'ECDH', public: publicKey },
        privateKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt','decrypt']
      );
    }

    async function encryptWithAESGCM(aesKey, plaintext) {
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const enc = new TextEncoder().encode(plaintext);
      const ct = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, enc);
      return arrayBufferToBase64(iv) + ':' + arrayBufferToBase64(ct);
    }

    async function decryptWithAESGCM(aesKey, bundle) {
      try {
        const parts = bundle.split(':');
        if (parts.length !== 2) return null;
        const iv = base64ToArrayBuffer(parts[0]);
        const ct = base64ToArrayBuffer(parts[1]);
        const pt = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, aesKey, ct);
        return new TextDecoder().decode(pt);
      } catch (err) {
        console.warn('Decrypt error', err);
        return null;
      }
    }

    // Private chat state
    window.privateChats = window.privateChats || {}; // chatId -> { otherId, myKeyPair, theirPub, aesKey, pendingMessages:[] }

    function getChatId(a, b) { return [a, b].sort().join('--'); }

    // Initiate private chat handshake
    async function startPrivateChat(memberId) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser || !currentUser.id) { showToast('Please log in','warning','Private chat is available after signing in'); return; }
      const me = currentUser.id;
      const chatId = getChatId(me, memberId);
      window.privateChats[chatId] = window.privateChats[chatId] || { otherId: memberId, pendingMessages: [] };

      // Generate my keypair if not present
      if (!window.privateChats[chatId].myKeyPair) {
        window.privateChats[chatId].myKeyPair = await generateECDHKeyPair();
        const pub64 = await exportPublicKeyBase64(window.privateChats[chatId].myKeyPair.publicKey);
        // Send my public key to recipient via server
        fetch('/api/private/init', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ to: memberId, from: me, publicKey: pub64 }) });
      }

      // Open the modal
      const modal = document.getElementById('privateChatModal');
      if (modal) modal.classList.add('active');
      const title = document.getElementById('privateChatTitle');
      if (title) title.textContent = 'Private Chat with ' + (teamMemberData[memberId]?.name || memberId);

      // Start polling for pending keys and inbox
      checkPendingAndInbox();
    }

    // Polling function to fetch pending public keys and inbox messages
    async function checkPendingAndInbox() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser || !currentUser.id) return;
      try {
        // Get pending public keys
        const res = await fetch(`/api/private/pending?userId=${encodeURIComponent(currentUser.id)}`);
        const data = await res.json();
        if (data && data.keys && data.keys.length) {
          for (const item of data.keys) {
            const from = item.from;
            const otherPublicBase64 = item.publicKey;
            const chatId = getChatId(currentUser.id, from);
            window.privateChats[chatId] = window.privateChats[chatId] || { otherId: from, pendingMessages: [] };

            // If we don't have our keypair, create and send it back
            if (!window.privateChats[chatId].myKeyPair) {
              window.privateChats[chatId].myKeyPair = await generateECDHKeyPair();
              const myPub = await exportPublicKeyBase64(window.privateChats[chatId].myKeyPair.publicKey);
              // reply with our public key so the initiator can derive too
              await fetch('/api/private/init', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ to: from, from: currentUser.id, publicKey: myPub }) });
            }

            // Import other public key and derive AES key
            const theirPubKey = await importPublicKeyBase64(otherPublicBase64);
            const aesKey = await deriveAESKey(window.privateChats[chatId].myKeyPair.privateKey, theirPubKey);
            window.privateChats[chatId].theirPub = otherPublicBase64;
            window.privateChats[chatId].aesKey = aesKey;
            showToast('Private chat ready', 'success', `Encrypted chat established with ${from}`);
          }
        }

        // Fetch inbox messages
        const inboxRes = await fetch(`/api/private/inbox?userId=${encodeURIComponent(currentUser.id)}`);
        const inboxData = await inboxRes.json();
        if (inboxData && inboxData.messages && inboxData.messages.length) {
          for (const m of inboxData.messages) {
            const from = m.from; const cipher = m.cipher; const chatId = getChatId(currentUser.id, from);
            window.privateChats[chatId] = window.privateChats[chatId] || { otherId: from, pendingMessages: [] };
            // If we have aesKey, decrypt and render; else buffer
            if (window.privateChats[chatId].aesKey) {
              const text = await decryptWithAESGCM(window.privateChats[chatId].aesKey, cipher);
              renderPrivateMessage(chatId, { from, text, ts: m.ts, incoming: true });
            } else {
              window.privateChats[chatId].pendingMessages.push({ from, cipher, ts: m.ts });
            }
          }
        }
      } catch (err) {
        // ignore network errors
      }
    }

    // Render message into private chat modal
    function renderPrivateMessage(chatId, message) {
      const container = document.getElementById('privateChatMessages');
      if (!container) return;
      const el = document.createElement('div');
      el.className = message.incoming ? 'private-msg incoming' : 'private-msg outgoing';
      el.innerHTML = `<div class="private-msg-meta"><strong>${message.from}</strong> <span class="time">${new Date(message.ts).toLocaleTimeString()}</span></div><div class="private-msg-body">${escapeHtml(message.text || '')}</div>`;
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
    }

    // Send a private message
    async function sendPrivateMessage() {
      const input = document.getElementById('privateChatInput');
      const msg = input && input.value.trim();
      if (!msg) return;
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const memberId = window.currentProfileMemberId;
      const chatId = getChatId(currentUser.id, memberId);
      const chat = window.privateChats[chatId];
      if (!chat || !chat.aesKey) { showToast('Encryption not established','warning','Please wait until the encrypted channel is ready'); return; }
      const cipher = await encryptWithAESGCM(chat.aesKey, msg);
      await fetch('/api/private/send', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ to: memberId, from: currentUser.id, cipher }) });
      renderPrivateMessage(chatId, { from: currentUser.id, text: msg, ts: Date.now(), incoming: false });
      if (input) input.value = '';
    }

    // Wire up private chat UI events
    document.addEventListener('DOMContentLoaded', function(){
      document.getElementById('privateChatSend')?.addEventListener('click', sendPrivateMessage);
      document.getElementById('closePrivateChat')?.addEventListener('click', function(){ document.getElementById('privateChatModal')?.classList.remove('active'); });

      // Periodic polling for pending keys & inbox
      setInterval(checkPendingAndInbox, 3000);
    });

    // Helper: when AES key becomes available, flush buffered messages
    function flushBufferedMessages(chatId) {
      const chat = window.privateChats[chatId];
      if (!chat || !chat.pendingMessages || !chat.aesKey) return;
      const pending = chat.pendingMessages.splice(0);
      pending.forEach(async (m) => {
        const text = await decryptWithAESGCM(chat.aesKey, m.cipher);
        renderPrivateMessage(chatId, { from: m.from, text, ts: m.ts, incoming: true });
      });
    }

    // Check for newly derived keys and flush
    setInterval(function(){
      Object.keys(window.privateChats).forEach(id => {
        if (window.privateChats[id] && window.privateChats[id].aesKey) flushBufferedMessages(id);
      });
    }, 2000);

    // End of private chat implementation


