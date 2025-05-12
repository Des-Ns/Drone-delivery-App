function abbreviateInput(input) {
  if (typeof input === 'string') {
    const el = String(input).substring(0, 5);

    return el;
  }

  const el = input.toFixed(0);

  return el;
}

function formatTime(seconds) {
  if (typeof seconds === 'number' && seconds >= 0) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(
      remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds
    );

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  return ' - ';
}

export function createTableRow(data, tableBody, orderRowMap) {
  const newRow = document.createElement('tr');
  console.log(':: createTableRow data=>', data);

  newRow.innerHTML = `
        <td>#${abbreviateInput(data.id)}</td>
        <td>${data.name}</td>
        <td>${data.location.x}/${data.location.y}</td>
        <td>#${abbreviateInput(data.customerId)}</td>
        <td>${abbreviateInput(data.distance)}</td>
        <td> - </td>
        <td>${data.status}</td>
      `;

  tableBody.appendChild(newRow);
  orderRowMap.set(data.id, newRow);
}

export function updateTable(data, tableBody, orderRowMap) {
  console.log('::updateTableRow data=>', data);

  const { id } = data;
  const existingRow = orderRowMap.get(id);

  if (existingRow) {
    const timeCell = existingRow.cells[5];
    const statusCell = existingRow.cells[6];

    timeCell.textContent = abbreviateInput(formatTime(data.time));
    statusCell.textContent = data.status; // === 'completed' ? 'completed' : 'in progress';
  } else {
    //! data is missing - name, location , customer.id, distance. properties
    // data = id, stautus, time
    createTableRow(data, tableBody, orderRowMap);
  }

  // REMOVE ORDER FROM DOM - If the order is completed, remove the row from the table and the map OPRION
  // if (data.status === 'Completed') {
  //   tableBody.removeChild(existingRow);
  //   orderRowMap.delete(id);
  // }
}

export function highlightElement(element) {
  if (element.classList.contains('active')) {
    element.classList.remove('active');

    return;
  }
  element.classList.add('active');
}
