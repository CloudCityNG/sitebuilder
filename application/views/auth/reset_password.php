<?php $this->load->view("shared/header.php");?>

<body class="login">
    
    <div class="container">
    
    	<div class="row">
    	
    		<div class="col-md-4 col-md-offset-4">
    		
    			<div class="logo">
                    <img src="<?php echo base_url('images/logo.svg')?>" alt="SiteBuilder Lite">
                </div>
    			
    			<!--<p><?php echo lang('login_subheading');?></p>-->
    			
    			<?php if( isset($message) && $message != '' ):?>
    			<div class="alert alert-success">
    				<button data-dismiss="alert" class="close fui-cross" type="button"></button>
    				<?php echo $message;?>
    			</div>
    			<?php endif;?>
    			    		
    			<form role="form" action="<?php echo site_url("auth/reset_password/".$code);?>" method="post">
    			
    				<?php echo form_input($user_id);?>
    				<?php echo form_hidden($csrf); ?>
    				
    				<div class="input-group">
    					<span class="input-group-btn">
    						 <button class="btn"><span class="fui-user"></span></button>
    					</span>
    			    	<input type="password" class="form-control" pattern="^.{8}.*$" id="new" value="" name="new" placeholder="Your new password">
   					</div>
   					
    			  	<div class="input-group">
    			  		<span class="input-group-btn">
    			  			 <button class="btn"><span class="fui-lock"></span></button>
    			  		</span>
    			  		<input type="password" class="form-control"  pattern="^.{8}.*$" id="new_confirm" value="" name="new_confirm" placeholder="Repeat your new password">
   					</div>
   					    			 	
    			  	<button type="submit" class="btn btn-primary btn-block"><?php echo lang('reset_password_submit_btn');?> <span class="fui-triangle-right-large"></span></button>
    			  	
    			  	<hr class="dashed light">
    			  	
    			</form>
    		
    		</div><!-- /.col -->
    	
    	</div><!-- /.row -->
    
    </div><!-- /.container -->
    
    <!-- Load JS here for greater good =============================-->
    <?php if( ENVIRONMENT == 'development' ):?>
    <script src="<?php echo base_url('js/vendor/jquery.min.js');?>"></script>
    <script src="<?php echo base_url('js/vendor/flat-ui-pro.min.js');?>"></script>
    <?php else:?>
    <script src="<?php echo base_url('js/build/login.min.js');?>"></script>
    <?php endif;?>
  </body>
</html>
