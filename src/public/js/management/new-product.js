const fileinputCommonOptions = {
	language: 'vi',
	showBrowse: false,
	showUpload: false,
	showRemove: true,
	showClose: false,
	required: true,
	initialPreviewShowDelete: true,
	browseOnZoneClick: true,

	allowedFileTypes: ['image'],
	allowedFileExtensions: ['png', 'jpg', 'jpeg', 'webp'],

	previewClass: 'flex-center',
	msgProcessing: 'Đang xử lý ...',
	msgFileRequired: 'Vui lòng chọn hình ảnh cho sản phẩm !',

	uploadUrl: '',
	deleteUrl: '',
};

$(document).ready(function () {
	$('#thumbnail').fileinput({
		...fileinputCommonOptions,
		maxFileCount: 1,
		maxFileSize: 1024, // 1 MB,
	});

	$('#photos').fileinput({
		...fileinputCommonOptions,
		maxFileCount: 5,
		maxFileSize: 2 * 1024, // 2 MB,
	});

	$('#form').submit(function (e) {
		e.preventDefault();
		const toastMsg = $('#toastMsg');

		const productName = $('#productName').val().trim();
		const price = Number($('#price').val());
		const unit = $('#unit').val()?.trim();

		if (!productName) {
			return showToastMsg(toastMsg, 'Vui lòng nhập tên sản phẩm', 'warning');
		}
		if (productName.length > 40) {
			return showToastMsg(
				toastMsg,
				'Tên sản phẩm dài tối đa 40 ký tự',
				'warning'
			);
		}

		if (isNaN(price) || price <= 0) {
			return showToastMsg(toastMsg, 'Vui lòng nhập giá sán phẩm', 'warning');
		}
		if (price < 500 || price > 1000_000_000) {
			return showToastMsg(
				toastMsg,
				'Giá sản phẩm từ 500 - 1.000.000.000 VNĐ',
				'warning'
			);
		}

		if (!unit) {
			return showToastMsg(toastMsg, 'Vui lòng nhập đơn vị tính', 'warning');
		}
		if (unit.length > 10) {
			return showToastMsg(
				toastMsg,
				'đơn vị tính dài tối đa 10 ký tự',
				'warning'
			);
		}

		const isThumbSelected = $('#thumbnail').fileinput('getFilesCount');
		if (!isThumbSelected) return;

		const isPhotosSelected = $('#photos').fileinput('getFilesCount');
		if (!isPhotosSelected) return;

		$('#submitBtn').addClass('disabled');
		$('#loading').removeClass('d-none');

		this.submit();
	});
});
