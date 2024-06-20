document.getElementById('add-transaction-button').addEventListener('click', addTransaction);
document.getElementById('filter-type').addEventListener('change', filterTransactions);
document.getElementById('search-description').addEventListener('input', filterTransactions);

let transactions = [];
let totalIncome = 0;
let totalExpenses = 0;

function addTransaction() {
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const type = document.getElementById('type').value;
    const errorMessage = document.getElementById('error-message');

    // Validate inputs
    if (description === '' || isNaN(amount) || amount <= 0 || date === '') {
        errorMessage.textContent = 'Please enter valid details.';
        errorMessage.style.display = 'block';
        return;
    }

    errorMessage.style.display = 'none';

    const transaction = {
        description,
        amount,
        date,
        category,
        type
    };

    transactions.push(transaction);
    renderTransaction(transaction);

    if (type === 'income') {
        totalIncome += amount;
    } else {
        totalExpenses += amount;
    }

    updateSummary();
    updateChart();
    updateCategorySummary();

    // Clear input fields after adding transaction
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
    document.getElementById('category').value = 'salary';
    document.getElementById('type').value = 'income';
}

function renderTransaction(transaction) {
    const transactionList = document.getElementById('transaction-list');
    const transactionItem = document.createElement('li');
    transactionItem.className = 'transaction-item';

    const transactionText = document.createElement('p');
    transactionText.textContent = `${transaction.date} - ${transaction.description} (${transaction.category}): $${transaction.amount.toFixed(2)}`;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteTransaction(transactionItem, transaction));

    transactionItem.appendChild(transactionText);
    transactionItem.appendChild(deleteButton);
    transactionList.appendChild(transactionItem);
}

function deleteTransaction(transactionItem, transaction) {
    transactionItem.remove();
    transactions = transactions.filter(t => t !== transaction);

    if (transaction.type === 'income') {
        totalIncome -= transaction.amount;
    } else {
        totalExpenses -= transaction.amount;
    }

    updateSummary();
    updateChart();
    updateCategorySummary();
}

function updateSummary() {
    document.getElementById('total-income').textContent = totalIncome.toFixed(2);
    document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
    document.getElementById('balance').textContent = (totalIncome - totalExpenses).toFixed(2);
}

function filterTransactions() {
    const filterType = document.getElementById('filter-type').value;
    const searchDescription = document.getElementById('search-description').value.toLowerCase();

    const filteredTransactions = transactions.filter(transaction => {
        const matchesType = filterType === 'all' || transaction.type === filterType;
        const matchesDescription = transaction.description.toLowerCase().includes(searchDescription);
        return matchesType && matchesDescription;
    });

    renderTransactionList(filteredTransactions);
}

function renderTransactionList(filteredTransactions) {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';

    filteredTransactions.forEach(transaction => {
        renderTransaction(transaction);
    });
}

function updateChart() {
    const ctx = document.getElementById('chart').getContext('2d');
    const labels = transactions.map(t => t.date);
    const data = {
        labels: labels,
        datasets: [{
            label: 'Income',
            backgroundColor: 'green',
            borderColor: 'green',
            data: transactions.filter(t => t.type === 'income').map(t => t.amount),
        }, {
            label: 'Expenses',
            backgroundColor: 'red',
            borderColor: 'red',
            data: transactions.filter(t => t.type === 'expense').map(t => t.amount),
        }]
    };

    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Income and Expenses Over Time'
            }
        }
    });
}

function updateCategorySummary() {
    const categorySummary = transactions.reduce((summary, transaction) => {
        if (!summary[transaction.category]) {
            summary[transaction.category] = { income: 0, expense: 0 };
        }
        if (transaction.type === 'income') {
            summary[transaction.category].income += transaction.amount;
        } else {
            summary[transaction.category].expense += transaction.amount;
        }
        return summary;
    }, {});

    const categorySummaryList = document.getElementById('category-summary-list');
    categorySummaryList.innerHTML = '';

    Object.keys(categorySummary).forEach(category => {
        const categoryItem = document.createElement('li');
        categoryItem.textContent = `${category} - Income: $${categorySummary[category].income.toFixed(2)}, Expense: $${categorySummary[category].expense.toFixed(2)}`;
        categorySummaryList.appendChild(categoryItem);
    });
}