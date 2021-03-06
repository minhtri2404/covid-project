(function () {
	if (packages && packages.length > 0) {
		packages = packages.map((p) => ({
			productPackageId: p.productPackageId,
			totalPrice: p.totalPrice,
			products: p.products.map((item) => ({
				productInPackageId: item.productInPackageId,
				productId: item.productId,
				productPrice: item.productPrice,
				maxQuantity: item.maxQuantity,
				quantity: 1,
			})),
		}));
	}
})();

function updatePaymentTotal(newTotal) {
	paymentTotal = newTotal;
	$('#paymentTotal').text(formatCurrency(newTotal));
}

function getPackage(packageId) {
	return packages.find((p) => p.productPackageId === packageId);
}

function getProduct(packageId, productInPackageId) {
	const package = getPackage(packageId);
	return package.products?.find(
		(p) => p.productInPackageId === productInPackageId
	);
}

function removePackage(packageId) {
	const package = getPackage(packageId);
	updatePaymentTotal(paymentTotal - package.totalPrice);
	packages = packages.filter((p) => p.productPackageId !== packageId);

	if (packages.length === 0) return location.reload();

	$(`.package-box[data-id="${packageId}"]`).remove();
	$('.total-package').text(packages.length);
}

function updatePackageTotalPrice(packageId, changedTotal) {
	const package = getPackage(packageId);
	if (package) {
		package.totalPrice += changedTotal;
		$(`.package-box[data-id="${packageId}"] .total-price`).text(
			formatCurrency(package.totalPrice)
		);
	}
}

function updateProductQuantity(packageId, productInPackageId, isPlus = false) {
	const product = getProduct(packageId, productInPackageId);

	if (product) {
		const { maxQuantity, quantity, productPrice } = product;
		if (isPlus && quantity === maxQuantity) return;
		if (!isPlus && quantity === 1) return;

		if (isPlus) {
			product.quantity++;
			updatePackageTotalPrice(packageId, productPrice);
			updatePaymentTotal(paymentTotal + productPrice);

			$(`.quantity-icon.minus[data-id="${productInPackageId}"]`).removeClass(
				'd-none'
			);
			product.quantity === maxQuantity &&
				$(`.quantity-icon.plus[data-id="${productInPackageId}"]`).addClass(
					'd-none'
				);
		} else {
			product.quantity--;
			updatePackageTotalPrice(packageId, -1 * productPrice);
			updatePaymentTotal(paymentTotal - productPrice);

			$(`.quantity-icon.plus[data-id="${productInPackageId}"]`).removeClass(
				'd-none'
			);
			product.quantity === 1 &&
				$(`.quantity-icon.minus[data-id="${productInPackageId}"]`).addClass(
					'd-none'
				);
		}

		$(`.quantity[data-id="${productInPackageId}"]`).text(product.quantity);
	}
}

async function onDebtBtnClick() {
	$(this).addClass('disabled');

	const paymentRes = await fetch('/user/payment/debt', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			carts: {
				paymentTotal,
				packages,
			},
		}),
	});

	if (paymentRes.status === 200) {
		showToastMsg(
			$('#toastMsg'),
			'?????t h??ng th??nh c??ng, ch??ng t??i s??? g???i ?????n b???n trong th???i gian s???m nh???t. Xin C???m ??n',
			'success',
			3000
		);
		removeAllCartItems();
		$('body').addClass('disabled');
		setTimeout(() => {
			location.href = '/user/info/debt';
		}, 3000);
	} else {
		const { msg } = await paymentRes.json();
		showToastMsg(
			$('#toastMsg'),
			msg ? msg : '?????t h??ng th???t b???i, th??? l???i sau. Xin c???m ??n',
			'danger',
			3000
		);
		$(this).removeClass('disabled');
	}
}

function renderNotEnoughMoneyModal(currentBalance) {
	const modalXML = `
<div class="modal fade" id="nemModal" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">S??? d?? kh??ng ?????</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p class="text-justify">
          S??? d?? hi???n t???i c???a b???n l?? <b>${formatCurrency(
						currentBalance
					)}</b>, kh??ng ????? ????? thanh to??n g??i s???n ph???m. B???n c?? th??? ch???n h??nh th???c thanh to??n tr??? ti???n sau (ghi n???) ????? ti???p t???c. D?? n??? s??? ???????c thanh to??n ?????nh k??? h??ng th??ng theo h???n m???c t???i thi???u v?? s??? ???????c tr??? tr???c ti???p trong l???n n???p ti???n ti???p theo.
        </p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Hu??? thanh to??n</button>
        <button id="debtBtn" type="button" class="btn btn-danger">Ghi n???</button>
        <button type="button" class="btn btn-primary">
          <a class="text-light" href="/user/payment/put-money">N???p ti???n ngay</a>
        </button>
      </div>
    </div>
  </div>
</div>`;
	$('body').append(modalXML);
	$('#nemModal').modal('show');
	$('#debtBtn').on('click', onDebtBtnClick);
}

$(document).ready(function () {
	loadCart();

	$('.remove-package').on('click', function () {
		const packageId = Number($(this).attr('data-id'));
		removeCartItem(packageId);
		removePackage(packageId);
	});

	$('#removeAll').on('click', function () {
		removeAllCartItems();
		location.reload();
	});

	$('.quantity-icon.plus').on('click', function () {
		const packageId = Number($(this).attr('data-package-id'));
		const productInPackageId = Number($(this).attr('data-id'));
		updateProductQuantity(packageId, productInPackageId, true);
	});

	$('.quantity-icon.minus').on('click', function () {
		const packageId = Number($(this).attr('data-package-id'));
		const productInPackageId = Number($(this).attr('data-id'));
		updateProductQuantity(packageId, productInPackageId, false);
	});

	$('#paymentBtn').on('click', async function () {
		$(this).addClass('disabled');

		const paymentRes = await fetch('/user/payment', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				carts: {
					paymentTotal,
					packages,
				},
			}),
		});

		if (paymentRes.status === 200) {
			showToastMsg(
				$('#toastMsg'),
				'?????t h??ng th??nh c??ng, ch??ng t??i s??? g???i ?????n b???n trong th???i gian s???m nh???t. Xin C???m ??n',
				'success',
				3000
			);
			removeAllCartItems();
			$('body').addClass('disabled');
			setTimeout(() => {
				location.href = '/user/info/payment-history';
			}, 3000);
		} else if (paymentRes.status === 406) {
			const { balance } = await paymentRes.json();
			renderNotEnoughMoneyModal(balance);
			$(this).removeClass('disabled');
		} else {
			showToastMsg(
				$('#toastMsg'),
				'?????t h??ng th???t b???i, th??? l???i sau. Xin c???m ??n',
				'danger',
				3000
			);
			$(this).removeClass('disabled');
		}
	});
});
