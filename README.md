# ft_Trascendence
The final Project of the 42_Common_Core

In this final project we have to setup an entire website ( in typescript ) to reproduce a PONG contest, there will be a ladder sistem, a matchmaking sistem,
a  (not so) small "social" behaviour in witch an user can :
  - Add other user as a friend (it's more like a Follow)
  - Chat with his/her friend
  - Chat with other user in a private/public/protected group
  - If moderator or Admin of the Chat/Group the user  can also :
      - Mute other users
      - kick other user outside the group
      - Ban other user so they can't join the chat no more
      - Make other user moderator of the chat/group 
  - Invite another user to play a private game, bypassing the matchmaking sistem

There's also a website admin (is me and the other guys i work with) that can :
  - Ban another user
  - See all the chat/group on the website ( and the messages inside it)
  - Remove a Participant from a group/chat
  - Remove an Admin from a group/chat

We also add a bunch of a features that where not asked for in the Subject but we try to push ourself even further :
  - notification when an user add you as a friend
  - You can click that notification to handle it
  - notification when an user send you a message opening a new chat o in an existing one
  - real time updating of the user information emitted by the server to all the clients
  - Readed status of a message ( read/notRead usign a monkey emoji)
  - search bar with suggestion
  - 3D graphics


in the directory you will find the Subject.

The server has this setup :
  - 7 dockerContainer : 
    - nestjs for backend
    - react for frontend
    - Postgres as our BD
    - Redis for Status(online/offline/in-game) used as a cache manager
    - Redis for Messages
    - Redis for Notification
    - Nginx as our unique access point

If you want to try you have to open up docker, cd at the root of the project and run the command 
  docker-compose up --build
  
this will set up and build ALL the project



Credits :
  - me (backend and a small part of frontend)
  - [Umberto Savoid](https://github.com/UmbertoSavoia) (backend and a small part of frontend)
  - me (backend and a small part of frontend)
  -  (databse and backend)
  -  (All the game part)
  -  (frontend and Graphics)
  -  (frontend and Graphics)
  -  (frontend)
