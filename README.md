# Complete-Login-Api
This is the complete login API made using Nodejs ,Express ,MongoDB database  ,testing through Postman ,

1)) register new user (/register)


2)) login valid user (/login)


3)) forget password 


  send email to login user with reset password token which expires after 10 min 
  need to change the password within 10 min 
  (/forgotPassword)
  
  
4)) resetPassword


    reset the password and allow user to input new password through patch request 
    (/resetPassword/:token)
    
    
5)) home


    Only the authorized user with valid token can access this endpoint 
    if user authorized send user info to cookie 
    (/home)
    
    
6))logout 
  logout the user 
  response cookie formatted
