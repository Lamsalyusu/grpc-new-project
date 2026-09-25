// ========================================
// Collaboration
// ========================================


function escapeCollaborationHtml(text) {

  const div = document.createElement('div');

  div.textContent = text || '';

  return div.innerHTML;

}


// ========================================
// Load Incoming Collaboration Requests
// ========================================


async function loadCollaborationRequests() {

  try {

    const res = await api('/collaboration/requests');

    const list =
      document.getElementById(
        'collaborationRequestsList'
      );

    if (!list) return;


    const requests =
      res.data?.reqs || [];


    console.log(
      'Collaboration requests:',
      requests
    );


    if (requests.length === 0) {

      list.innerHTML = `
        <p class="collaboration-empty-state">
          No pending collaboration requests.
        </p>
      `;

      return;

    }


    list.innerHTML = requests
      .map(request => {

        const senderName =
          escapeCollaborationHtml(
            request.sender_name ||
            'Unknown User'
          );


        const senderInitial =
          escapeCollaborationHtml(
            (request.sender_name || 'U')
              .charAt(0)
              .toUpperCase()
          );


        return `
          <div class="collaboration-request-card">

            <div class="collaboration-request-info">

              <div class="collaboration-request-avatar">
                ${senderInitial}
              </div>

              <div class="collaboration-request-details">

                <div class="collaboration-request-title">
                  Collaboration Request
                </div>

                <div class="collaboration-request-sender">
                  From: ${senderName}
                </div>

              </div>

            </div>


            <div class="collaboration-request-actions">

              <button
                type="button"
                class="btn-accept-request"
                data-id="${request.id}"
              >
                Accept
              </button>


              <button
                type="button"
                class="btn-reject-request"
                data-id="${request.id}"
              >
                Reject
              </button>

            </div>

          </div>
        `;

      })
      .join('');


    // ========================================
    // Accept Buttons
    // ========================================

    list
      .querySelectorAll(
        '.btn-accept-request'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            acceptCollaborationRequest(
              button.dataset.id
            );

          }
        );

      });


    // ========================================
    // Reject Buttons
    // ========================================

    list
      .querySelectorAll(
        '.btn-reject-request'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            rejectCollaborationRequest(
              button.dataset.id
            );

          }
        );

      });


  } catch (err) {

    console.error(
      'Failed to load collaboration requests:',
      err
    );


    const list =
      document.getElementById(
        'collaborationRequestsList'
      );


    if (list) {

      list.innerHTML = `
        <p style="color:#ef4444;">
          Could not load collaboration requests.
        </p>
      `;

    }

  }

}


// ========================================
// Send Collaboration Request
// ========================================


async function sendCollaborationRequest(
  receiverEmail
) {

  try {

    await api(
      '/collaboration/request',
      {
        method: 'POST',

        body: JSON.stringify({
          receiver_email: receiverEmail
        })
      }
    );


    alert(
      'Collaboration request sent successfully.'
    );


    return true;


  } catch (err) {

    alert(err.message);

    return false;

  }

}


// ========================================
// Accept Collaboration Request
// ========================================


async function acceptCollaborationRequest(
  requestId
) {

  try {

    await api(
      `/collaboration/request/${requestId}/accept`,
      {
        method: 'PATCH'
      }
    );


    alert(
      'Collaboration request accepted.'
    );


    // Remove accepted request from
    // incoming requests list.
    await loadCollaborationRequests();


    // The accepted user is now a collaborator,
    // so refresh the collaborators list.
    await loadCollaborators();


  } catch (err) {

    alert(err.message);

  }

}


// ========================================
// Reject Collaboration Request
// ========================================


async function rejectCollaborationRequest(
  requestId
) {

  try {

    await api(
      `/collaboration/request/${requestId}/reject`,
      {
        method: 'PATCH'
      }
    );


    alert(
      'Collaboration request rejected.'
    );


    await loadCollaborationRequests();


  } catch (err) {

    alert(err.message);

  }

}


// ========================================
// Send Request Form
// ========================================


document
  .getElementById(
    'collaborationRequestForm'
  )
  ?.addEventListener(
    'submit',
    async (e) => {

      e.preventDefault();


      const input =
        document.getElementById(
          'collaborationUserEmail'
        );


      if (!input) return;


      const receiverEmail =
        input.value.trim();


      if (!receiverEmail) {

        alert(
          'Please enter an email.'
        );

        return;

      }


      const success =
        await sendCollaborationRequest(
          receiverEmail
        );


      if (success) {

        input.value = '';

      }

    }
  );


// ========================================
// Load My Collaborators
// ========================================


async function loadCollaborators() {

  try {

    const res =
      await api(
        '/collaboration/collaborators'
      );


    const list =
      document.getElementById(
        'collaboratorsList'
      );


    if (!list) return;


    const collaborators =
      res.data?.collaborators || [];


    console.log(
      'My collaborators:',
      collaborators
    );


    if (collaborators.length === 0) {

      list.innerHTML = `
        <p class="collaboration-empty-state">
          No collaborators yet.
        </p>
      `;

      return;

    }


    list.innerHTML = collaborators
      .map(collaborator => {

        const name =
          escapeCollaborationHtml(
            collaborator.name ||
            'Unknown User'
          );


        const email =
          escapeCollaborationHtml(
            collaborator.email ||
            ''
          );


        const id =
          escapeCollaborationHtml(
            collaborator.id ||
            ''
          );


        const initial =
          escapeCollaborationHtml(
            (collaborator.name || 'U')
              .charAt(0)
              .toUpperCase()
          );


        return `
          <div class="collaborator-card">

            <div class="collaborator-info">

              <div class="collaborator-avatar">
                ${initial}
              </div>


              <div class="collaborator-details">

                <div class="collaborator-name">
                  ${name}
                </div>


                <div class="collaborator-email">
                  ${email}
                </div>

              </div>

            </div>


            <button
              type="button"
              class="btn-remove-collaborator"
              data-id="${id}"
            >
              Remove
            </button>

          </div>
        `;

      })
      .join('');


    // ========================================
    // Remove Buttons
    // ========================================

    list
      .querySelectorAll(
        '.btn-remove-collaborator'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            removeCollaborator(
              button.dataset.id
            );

          }
        );

      });


  } catch (err) {

    console.error(
      'Failed to load collaborators:',
      err
    );


    const list =
      document.getElementById(
        'collaboratorsList'
      );


    if (list) {

      list.innerHTML = `
        <p style="color:#ef4444;">
          Could not load collaborators.
        </p>
      `;

    }

  }

}


// ========================================
// Remove Collaborator
// ========================================


async function removeCollaborator(
  targetUserId
) {

  if (!targetUserId) {

    alert(
      'Invalid collaborator.'
    );

    return;

  }


  const confirmed =
    confirm(
      'Are you sure you want to remove this collaborator?'
    );


  if (!confirmed) {

    return;

  }


  try {

    await api(
      `/collaboration/${targetUserId}`,
      {
        method: 'DELETE'
      }
    );


    alert(
      'Collaborator removed successfully.'
    );


    // Refresh the list after deletion.
    await loadCollaborators();


  } catch (err) {

    console.error(
      'Failed to remove collaborator:',
      err
    );


    alert(err.message);

  }

}


// ========================================
// Initial Load
// ========================================


if (
  document.getElementById(
    'collaborationRequestsList'
  )
) {

  loadCollaborationRequests();

}


if (
  document.getElementById(
    'collaboratorsList'
  )
) {

  loadCollaborators();

}