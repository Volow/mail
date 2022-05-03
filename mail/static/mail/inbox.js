document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // console.log('Loaded')

  document.querySelector('#compose-form').addEventListener('submit', send_email)
    

  document.querySelector('#compose-form').onsubmit = function(){
    console.log('Submit')
    return false
  }

  // By default, load the inbox
  load_mailbox('inbox');
});

function send_email(event){

  event.preventDefault();

  const recipints = document.querySelector('#compose-recipients').value
  const subject = document.querySelector('#compose-subject').value
  const body = document.querySelector('#compose-body').value

  // console.log(`recipints: ${recipints}, subject ${subject}, body: ${body}`)

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipints,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  })
  .catch((error) => console.log(error));
  
 
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if(mailbox == 'inbox'){
    fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {
          // Print emails
          emails.forEach(email => {

            const div = document.createElement('div')
            div.style.border = 'solid'
            div.style.margin = '3px'
            div.style.borderWidth = '1px'
            div.style.borderRadius = '3px'

            div.addEventListener('click', () =>{
              read_email(email['id'])
            })

            const sender = document.createElement('p')
            sender.style.margin = '5px'

            const subject = document.createElement('p')
            subject.style.margin = '5px'

            const body = document.createElement('p')
            body.style.margin = '5px'

            sender.innerHTML = `Sender: ${email['sender']}`  
            div.append(sender)

            subject.innerHTML = `Subject: ${email['subject']}`  
            div.append(subject)

            body.innerHTML = `Body: ${email['body']}`  
            div.append(body)

            document.querySelector('#emails-view').append(div)
            console.log(email);
          }); 

          // ... do something else with emails ...
      });
  }
}

function read_email(email_id){
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // ... do something else with email ...
  });
}