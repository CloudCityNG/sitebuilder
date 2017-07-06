<?php

class EnvatoAPI {

	public function __construct()
	{
		//
	}

	public function get_purchase($purchaseKey)
	{
		//$product_code = "";
		$url = "https://api.envato.com/v3/market/author/sale?code=" . $purchaseKey;
		$curl = curl_init($url);

		$personal_token = "u7ynWmm7OzuY7KEtYkiVS8XhmVtgTP1f";
		$header = array();
		$header[] = 'Authorization: Bearer '.$personal_token;
		$header[] = 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:41.0) Gecko/20100101 Firefox/41.0';
		$header[] = 'timeout: 20';
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_HTTPHEADER,$header);

		$envatoRes = curl_exec($curl);
		curl_close($curl);
		$envatoRes = json_decode($envatoRes);
		// print_r($envatoRes);
		// die();

		if (isset($envatoRes->item->name)) {
			$date = new DateTime($envatoRes->supported_until);
			$result = $date->format('Y-m-d H:i:s');
			$data = "VERIFIED - (Supported: {$result})";
		} else {
			$data= "FAILED";
		}

		return $data;
	}
}