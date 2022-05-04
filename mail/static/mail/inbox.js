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
      //message_view(result)
      load_mailbox('sent', result)

  })
  .catch((error) => console.log(error));
  
  // load_mailbox('sent', result)
}

function compose_email(recipient = '', subject_reply='', body = '') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  console.log(recipient)

  if(recipient !== '' && subject_reply !== ''){
    document.querySelector('#compose-recipients').value = recipient;
    document.querySelector('#compose-subject').value = subject_reply
    document.querySelector('#compose-body').value = body;
  }else{
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
}

function message_view(message){
  const message_div = document.createElement('div')
  message_div.classList.add('alert')

  if (message['error']){
    message_div.classList.add('alert-danger')
    message_div.innerHTML = message['error']
  } else if (message['message']){
    message_div.classList.add('alert-success')
    message_div.innerHTML = message['message']
  }

  document.querySelector("#message-div").appendChild(message_div);
}

function load_mailbox(mailbox, message = '') {
    // Delete any messages if any
    document.querySelector("#message-div").textContent = "";

    // Print a message if any.
    if (message !== "") {
      message_view(message);
    }
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  
    fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(emails => {
          // Print emails
          emails.forEach(email => {

            //console.log(email)

            email_view(email, mailbox)
            
          }); 

          // ... do something else with emails ...
      });
  }


function read_email(email_id){

  document.querySelector('#emails-view').innerHTML = ''

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      // console.log(email);

      // ... do something else with email ...

      email_view(email, mailbox = 'reading')

  });
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  // load_mailbox('inbox')
}

function email_view(email, mailbox){
    const div = document.createElement('div')
    div.style.border = 'solid'
    div.style.margin = '3px'
    div.style.borderWidth = '1px'
    div.style.borderRadius = '3px'

    if (email['read'] === true && mailbox === 'inbox'){
      div.style.background = '#e4e4e4'
    } 

    if (mailbox === 'inbox') {

      const sender = document.createElement('p')
      sender.style.margin = '5px'

      sender.innerHTML = `Sender: ${email['sender']}`  
      div.append(sender)

      div.addEventListener('click', () =>{
        read_email(email['id'])
      })
    }     

    const subject = document.createElement('p')
    subject.style.margin = '5px'   

    subject.innerHTML = `Subject: ${email['subject']}`  
    div.append(subject)

    if (mailbox === 'reading'){  
      const sender = document.createElement('p')
      sender.style.margin = '5px'

      sender.innerHTML = `From: ${email['sender']}`  
      div.append(sender)      

      const body = document.createElement('p')
      body.style.margin = '5px'
      
      body.innerHTML = `Body: ${email['body']}`  
      div.append(body)

      const button_archive = document.createElement('button')
      // button_archive.id = 'button_arhive'
      button_archive.classList.add('btn')
      button_archive.classList.add('btn-primary')
      button_archive.classList.add('m-3')      
      button_archive.innerHTML = 'Arhivate'
      div.append(button_archive)

      button_archive.addEventListener('click', ()=>{
        email_arhive(email['id'])
      })

      const button_reply = document.createElement('button')
      // button_archive.id = 'button_arhive'
      button_reply.classList.add('btn')
      button_reply.classList.add('btn-primary')
      button_reply.classList.add('m-3')      
      button_reply.innerHTML = 'Reply'
      div.append(button_reply)

      button_reply.addEventListener('click', ()=>{
        console.log('reply')

        const recipient = email['sender']
        const subject_reply = ((email["subject"].match(/^(Re:)\s/)) ? email["subject"] : "Re: " + email["subject"])
        const body = `On ${email["timestamp"]} ${email["sender"]} wrote:\n${email["body"]}\n-------------------------------------\n`
        compose_email(recipient, subject_reply, body)
      })
    }
    
    if (mailbox === 'sent'){
      const recipients = document.createElement('p')
      recipients.style.margin = '5px'

      recipients.innerHTML = `Recipients: ${email['recipients']}`  
      div.append(recipients)

    }


    document.querySelector('#emails-view').append(div)
    //console.log(email);
}

function email_arhive(email_id){
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  
  load_mailbox('archive') 
}