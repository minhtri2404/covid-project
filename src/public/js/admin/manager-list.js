const ROOT_URL = '/admin/managers/list';

const renderAccountHistories = (actives) => {
	if (actives.length === 0) {
		return '<p class="text-center">Không có lịch sử hoạt động nào</p>';
	}
	let tableData = [];
	for (let i = 0; i < actives.length; ++i) {
		tableData.push(
			`<tr>
				<td>${actives[i].activity}</td>
				<td>${formatDateToStr(actives[i].createdDate)}</td>
			</tr>
      `
		);
	}
	return `
	  <table class="table table-striped table-light table-bordered w-100">
	    <thead class="thead-dark">
	      <tr>
	        <th scope="col">Hoạt động</th>
	        <th scope="col">Thời gian</th>
	      </tr>
	    </thead>
	    <tbody>
		    ${tableData.join('')}
		</tbody>
	  </table>
	`;
};

$(document).ready(function () {
	// pagination
	const paginationContainer = $('#pagination');

	if (paginationContainer.length) {
		pagination(paginationContainer, total, pageSize, currentPage, {
			showGoInput: true,
			showGoButton: true,

			// When click pagination item
			callback: () => {
				$('#pagination li:not(.disabled)').click(async function () {
					const page = $(this).attr('data-num');
					if (page == currentPage) return;
					location.href = ROOT_URL + generateQuery(page, sortList, search);
				});

				$('#pagination .paginationjs-go-button').click(function () {
					const input = $('.paginationjs-go-input input');
					const page = parseInt(input.val());
					if (isNaN(page) || page < 1 || page > Math.ceil(total / pageSize)) {
						input.val('');
						return;
					}
					location.href = ROOT_URL + generateQuery(page, sortList, search);
				});
			},
		});
	}

	// add sort class
	addSortClass(sortList);

	// sort icon click
	sortIconClick($('.sort-icon'), currentPage, sortList, search, (query) => {
		location.href = ROOT_URL + query;
	});

	// search button click
	$('#searchBtn:not(.disabled)').click(function () {
		const searchQuery = $('#searchInput').val().trim();
		if (!searchQuery) return;

		$(this).addClass('disabled');

		const href = `${ROOT_URL}${generateQuery(
			1,
			sortList
		)}&search=${searchQuery}`;

		location.href = href;
	});

	$('.info-icon').click(async function () {
		const accountId = $(this).attr('data-id');
		if (!accountId) return;
		const loading = $('#loading');
		const modalBody = $('#userModalBody');
		const modal = $('#userModal');

		// loading
		loading.removeClass('d-none');
		modalBody.empty();
		modal.fadeIn(200).modal('show');

		const historyRes = await fetch(`/admin/managers/${accountId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		loading.addClass('d-none');

		if (historyRes.status === 200) {
			const history = await historyRes.json();
			modalBody.html(renderAccountHistories(history));
		} else {
			modalBody.html(
				'<div class="alert alert-danger">Lấy dữ liệu thất bại. Thử lại !</div>'
			);
		}
	});

	// show edit user modal
	$('select').selectize({
		shortField: 'text',
	});

	$('.edit-icon').click(async function () {
		const modal = $('#editModal');

		modal.removeClass('d-none');
		modal.fadeIn(200).modal('show');

		const accountId = $(this).attr('data-id');
		const isLocked = $(this).attr('data-locked') == '1' ? true : false;

		$('#isLocked').prop('checked', isLocked);

		modal.attr('data-id', accountId);
		modal.attr('data-locked', isLocked ? 1 : 0);
	});

	$('#updateBtn').click(async function () {
		const toast = $('#toastMsg');
		const editModal = $('#editModal');

		const accountId = Number(editModal.attr('data-id'));

		const oldIsLocked = editModal.attr('data-locked') == 1 ? true : false;
		const newIsLocked = $('#isLocked').is(':checked');

		if (oldIsLocked == newIsLocked) {
			return;
		}

		$(this).addClass('disabled');

		const resJSON = await fetch('/admin/managers/update', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				accountId,
				newIsLocked,
			}),
		});

		if (resJSON.status === 200) {
			showToastMsg(toast, 'Cập nhật thành công', 'success', 1000);
			location.reload();
		} else {
			const { msg } = await resJSON.json();
			$(this).removeClass('disabled');
			showToastMsg(toast, msg || 'Cập nhật thất bại', 'danger', 3000);
		}
	});
});
