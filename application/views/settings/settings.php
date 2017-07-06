<?php $this->load->view("shared/header.php");?>

<body>
  	
  	<?php $this->load->view("shared/nav.php");?>   
  	
    <div class="container-fluid">
    	
    	<div class="row">
    	
    		<div class="col-md-9 col-sm-8">
    	
		    	<h1><span class="fui-gear"></span> <?php echo $this->lang->line('settings_heading')?></h1>
    	
    		</div><!-- /.col -->
    		
    		<div class="col-md-3 col-sm-4 text-right">
    		
    		    
    		
    		</div><!-- /.col -->
    	
    	</div><!-- /.row -->
    	
    	<hr class="dashed margin-bottom-30">
    	
    	<div class="row">
    	
    		<div class="col-md-12">
    		
    			<ul class="nav nav-tabs nav-append-content">
					<li class="active"><a href="#appSettings"><span class="fui-gear"></span> <?php echo $this->lang->line('settings_tab_applicationsettings')?></a></li>
				</ul> <!-- /tabs -->
      	
				<div class="tab-content">
								
					<div class="tab-pane active" id="appSettings">
						
						<div class="row">
						
							<div class="col-md-8">
							
								<?php if( $this->session->flashdata('error') == '' && $this->session->flashdata('success') == '' ):?>
							
								<div class="alert alert-warning">
									<button type="button" class="close fui-cross" data-dismiss="alert"></button>
									<h4><?php echo $this->lang->line('settings_warning_heading')?></h4>
									<p>
										<?php echo $this->lang->line('settings_warning_message')?>
									</p>
								</div>
								
								<?php else:?>
								
									<?php if( $this->session->flashdata('error') != '' ):?>
									<div class="alert alert-error">
									<button type="button" class="close fui-cross" data-dismiss="alert"></button>
									<h4>Error</h4>
									<?php echo $this->session->flashdata('error');?>
									</div>
									<?php endif;?>
									
									<?php if( $this->session->flashdata('success') != '' ):?>
									<div class="alert alert-success">
									<button type="button" class="close fui-cross" data-dismiss="alert"></button>
									<h4>Success!</h4>
									<?php echo $this->session->flashdata('success');?>
									</div>
									<?php endif;?>
								
								<?php endif;?>
							
								<form class="form-horizontal settingsForm" role="form" id="settingsForm" method="post" action="<?php echo site_url('configuration/update')?>">
									<?php foreach( $settings as $configItem ):?>
									<div class="form-group">
										<label for="<?php echo $configItem->config_name;?>" class="col-sm-3 control-label"><?php echo $configItem->config_name;?> <?php if( $configItem->config_required == 1 ):?>*<?php endif;?></label>
										<div class="col-sm-9">
											<textarea class="form-control" name="<?php echo $configItem->config_name;?>" id="<?php echo $configItem->config_name;?>"><?php echo $configItem->config_value;?></textarea>
											<div class="settingDescription">
												<?php echo $configItem->config_description;?>
											</div>
										</div>
									</div>
									<?php endforeach;?>
									<div class="form-group">
										<div class="col-sm-offset-3 col-sm-9">
											<p class="text-danger">
											<?php echo $this->lang->line('settings_requiredfields');?>
											</p>
											<button type="submit" class="btn btn-primary btn-wide"><span class="fui-check"></span> <?php echo $this->lang->line('settings_button_update')?></button>
										</div>
									</div>
								</form>
							
							</div><!-- /.col -->
							
							<div class="col-md-4">
							
								<div class="alert alert-info configHelp" id="configHelp">
									<button type="button" class="close fui-cross" data-dismiss="alert"></button>
									<div>
										<h4>
											<?php echo $this->lang->line('settings_confighelp_heading')?>
										</h4>
										<p>
											<?php echo $this->lang->line('settings_confighelp_message')?>
										</p>
									</div>
								</div>
							
							</div><!-- /.col -->
						
						</div><!-- /.row -->							
												
					</div>
      	
				</div> <!-- /tab-content -->
    		
    		</div><!-- /.col -->
    	
    	</div><!-- /.row -->
    	
    </div><!-- /.container -->
			
	<!-- Modal -->
		
	<?php $this->load->view("shared/modal_account.php");?> 
	
	<!-- /modals -->

	<!-- Load JS here for greater good =============================-->
	<?php if( ENVIRONMENT == 'development' ):?>
	<script src="<?php echo base_url('js/vendor/jquery.min.js');?>"></script>
    <script src="<?php echo base_url('js/vendor/flat-ui-pro.min.js');?>"></script>
    <script src="<?php echo base_url('js/build/settings.js');?>"></script>
	<?php else:?>
    <script src="<?php echo base_url('js/build/settings.min.js');?>"></script>
	<?php endif;?>
    
  </body>
</html>