<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title><?php if( isset($pageTitle) ){ echo $pageTitle; } else { echo $this->lang->line('alternative_page_title'); }?></title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
	<?php if( ENVIRONMENT == 'development' ):?>

	<link href="<?php echo base_url();?>css/vendor/bootstrap.min.css" rel="stylesheet">
	<link href="<?php echo base_url();?>css/flat-ui-pro.css" rel="stylesheet">
	<link href="<?php echo base_url();?>css/style.css" rel="stylesheet">
	<link href="<?php echo base_url();?>css/login.css" rel="stylesheet">
	<link href="<?php echo base_url();?>css/font-awesome.css" rel="stylesheet">

	<link href="<?php echo base_url();?>css/builder.css" rel="stylesheet">
	<link href="<?php echo base_url();?>css/spectrum.css" rel="stylesheet">
	<link href="<?php echo base_url();?>css/chosen.css" rel="stylesheet">
	<link href="<?php echo base_url();?>css/summernote.css" rel="stylesheet">

	<?php else: ?>

	<link href="<?php echo base_url();?>css/build-main.min.css" rel="stylesheet">
		
	<?php if( isset($builder) ):?>
	<link href="<?php echo base_url();?>css/build-builder.min.css" rel="stylesheet">
	<?php endif;?>

	<?php endif;?>
		
	<link rel="shortcut icon" href="<?php echo base_url();?>images/favicon.png">
	
	<!-- HTML5 shim, for IE6-8 support of HTML5 elements. All other JS at the end of file. -->
	<!--[if lt IE 9]>
	<script src="<?php echo base_url();?>js/html5shiv.js"></script>
	<script src="<?php echo base_url();?>js/respond.min.js"></script>
	<![endif]-->
	<!--[if lt IE 10]>
	<link href="<?php echo base_url();?>css/ie-masonry.css" rel="stylesheet">
	<script src="<?php echo base_url();?>js/masonry.pkgd.min.js"></script>
	<![endif]-->
    
    <script>
    var baseUrl = '<?php echo base_url('/');?>';
    var siteUrl = '<?php echo site_url('/');?>';
    </script>
</head>