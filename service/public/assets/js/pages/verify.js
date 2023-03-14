jQuery(document).ready(($) => {
  let sLocation = document.location.href,
    aSplit = sLocation.split('?');

  if (aSplit.length > 1) {
    let aParams = aSplit[1].split('='),
      sToken = '';

    if (aParams.length > 1) {
      sToken = aParams[1];

      $.ajax({
        headers: common.headers,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: `${common.getUrl()}/verify`,
        data: JSON.stringify({
          token: sToken,
        }),
      }).always(onEndVerify);
    }
  }
});

function onEndVerify(oResponse, sStatus) {
  let json = oResponse.responseJSON || {};
  let $alert =
    sStatus === 'success'
      ? $('#msg-success')
      : oResponse.status === 400
        ? $('#msg-error')
        : $('#msg-success');

  if ($alert.length) {
    if (json.message) {
      let $text = $alert.find('.alert-text').html(json.message);
    }
    $alert.fadeIn('fast');
  }
}
