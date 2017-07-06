<?php $this->load->view("shared/header.php");?>

<body class="login">
    
    <div class="container">
    
    	<div class="row">
    	
    		<div class="col-md-4 col-md-offset-4">
    		
    			<h2 class="text-center">
    			 	<?php echo $this->lang->line('createuser_heading')?>
    			</h2>
    			
    			<!--<p><?php echo lang('login_subheading');?></p>-->
    			
    			<?php if( isset($message) && $message != '' ):?>
    			<div class="alert alert-success">
    				<button data-dismiss="alert" class="close fui-cross" type="button"></button>
    				<?php echo $message;?>
    			</div>
    			<?php endif;?>
    			    		
    			<form role="form" action="<?php echo site_url("auth/create_user");?>" method="post">
    				
    				<div class="input-group">
    					<span class="input-group-btn">
    						 <button class="btn"><span class="fui-arrow-right"></span></button>
    					</span>
    			    	<input type="text" class="form-control" id="first_name" name="first_name" placeholder="<?php echo $this->lang->line('createuser_placeholder_firstname')?>" value="<?php if( isset($_POST['first_name']) ) {echo $_POST['first_name'];}?>">
   					</div>
   					
    			  	<div class="input-group">
    			  		<span class="input-group-btn">
    			  			 <button class="btn"><span class="fui-arrow-right"></span></button>
    			  		</span>
    					<input type="text" class="form-control" id="last_name" name="last_name" placeholder="<?php echo $this->lang->line('createuser_placeholder_lastname')?>" value="<?php if( isset($_POST['last_name'])  ) {echo $_POST['last_name'];}?>">
   					</div>
					
    			  	<div class="input-group">
    			  		<span class="input-group-btn">
    			  			 <button class="btn"><span class="fui-arrow-right"></span></button>
    			  		</span>
    					<input type="email" class="form-control" id="email" name="email" placeholder="<?php echo $this->lang->line('createuser_placeholder_email')?>" value="<?php if( isset($_POST['email']) )  {echo $_POST['email'];}?>">
   					</div>
					
    			  	<div class="input-group">
    			  		<span class="input-group-btn">
    			  			 <button class="btn"><span class="fui-arrow-right"></span></button>
    			  		</span>
    					<input type="password" class="form-control" id="password" name="password" placeholder="<?php echo $this->lang->line('createuser_placeholder_password')?>" value="<?php if( isset($_POST['password'])  ) {echo $_POST['password'];}?>">
   					</div>
					
    			  	<div class="input-group">
    			  		<span class="input-group-btn">
    			  			 <button class="btn"><span class="fui-arrow-right"></span></button>
    			  		</span>
    					<input type="password" class="form-control" id="password_confirm" name="password_confirm" placeholder="<?php echo $this->lang->line('createuser_placeholder_confirmpassword')?>" value="<?php if( isset($_POST['password_confirm']) ) {echo $_POST['password_confirm'];}?>">
   					</div>
					
					<?php echo $captcha;?>
					<div class="input-group">
    			  		<span class="input-group-btn">
    			  			 <button class="btn"><span class="fui-arrow-right"></span></button>
    			  		</span>
    					<input type="text" class="form-control" id="captcha" name="captcha" placeholder="<?php echo $this->lang->line('createuser_placeholder_captcha')?>">
					</div>
    			 	
    			  	<button type="submit" class="btn btn-primary btn-block btn-embossed"><?php echo $this->lang->line('createuser_button_createaccount')?></span></button>
											
					<hr class="dashed light">
				
					<div class="text-center">
						<a href="<?php echo site_url("login");?>" style="font-size: 15px"><span class="fui-arrow-left"></span> <?php echo $this->lang->line('createuser_backlink')?></a>
					</div>						
					
    			</form>
									    		
    		</div><!-- /.col -->
    	
    	</div><!-- /.row -->
    
    </div><!-- /.container -->
    

    <!-- Load JS here for greater good =============================-->
    <script src="<?php echo base_url();?>js/jquery-1.8.3.min.js"></script>
    <script src="<?php echo base_url();?>js/jquery-ui-1.10.3.custom.min.js"></script>
    <script src="<?php echo base_url();?>js/jquery.ui.touch-punch.min.js"></script>
    <script src="<?php echo base_url();?>js/bootstrap.min.js"></script>
    <script src="<?php echo base_url();?>js/bootstrap-select.js"></script>
    <script src="<?php echo base_url();?>js/bootstrap-switch.js"></script>
    <script src="<?php echo base_url();?>js/flatui-checkbox.js"></script>
    <script src="<?php echo base_url();?>js/flatui-radio.js"></script>
    <script src="<?php echo base_url();?>js/jquery.tagsinput.js"></script>
    <script src="<?php echo base_url();?>js/flatui-fileinput.js"></script>
    <script src="<?php echo base_url();?>js/jquery.placeholder.js"></script>
    <script src="<?php echo base_url();?>js/application.js"></script>
  </body>
</html>