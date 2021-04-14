'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

// displayMovements(account1.movements);

//Utility Functions

//IIFE
const createUserNames = (function (accounts) {
  accounts.forEach(function (account) {
    account.userName = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
})(accounts);

const updateUI = function (account) {
  displayMovements(account);
  calculateDisplayFinalBalance(account);
  calcDisplaySummary(account);
};

//-> Setting up the movements (transactions) dynamically from the account data

const displayMovements = function (account) {
  containerMovements.innerHTML = '';
  account.movements.forEach((value, index) => {
    const movementType = value > 0 ? 'deposit' : 'withdrawal';
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${movementType}">${
      index + 1
    } ${movementType}</div>
          <div class="movements__date">3 days ago</div>
          <div class="movements__value">${value}€</div>
        </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
const calculateDisplayFinalBalance = function (account) {
  account.balance = account.movements.reduce(
    (accumulator, movement) => accumulator + movement
  );
  labelBalance.textContent = `${account.balance}€`;
};

// calculateDisplayFinalBalance(account1.movements);

const calcDisplaySummary = function (account) {
  const income = account.movements
    .filter(movement => movement > 0)
    .reduce((accumulator, movement) => accumulator + movement);
  labelSumIn.textContent = `${income}€`;

  const outgoing = account.movements
    .filter(movement => movement < 0)
    .reduce((accumulator, movement) => accumulator + movement);
  labelSumOut.textContent = `${Math.abs(outgoing)}€`;

  const interest = account.movements
    .filter(movement => movement > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((accumulator, interest) => accumulator + interest);

  labelSumInterest.textContent = `${interest}€`;
};
// calcDisplaySummary(account1.movements);

//Event Handlers
let currentAccount = '';
btnLogin.addEventListener('click', function (event) {
  event.preventDefault();

  currentAccount = accounts.find(
    account => account.userName === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and welcome msg
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    //Set Opacity to 100
    containerApp.style.opacity = 100;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Display Movements, Balance, Summary
    updateUI(currentAccount);
  } else if (!currentAccount || currentAccount?.pin !== Number(inputLoginPin.value)) alert('Incorrect Username or Password 😢');
});

btnTransfer.addEventListener('click', function (event) {
  event.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );

  if (!receiverAcc) alert('Enter valid receiver 😠');
  else if (amount <= 0) alert('Amount must be greater than 0 😏');
  else if (!(currentAccount.balance >= amount))
    alert('No sufficient balance 😥');
  else if (receiverAcc.userName === currentAccount.userName)
    alert('You cannot transfer money to self 😠');
  else {
    receiverAcc.movements.push(amount);
    currentAccount.movements.push(-amount);
    alert('Money Transfered Successfully 🎉');
    updateUI(currentAccount);
  }

  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();
});

btnClose.addEventListener('click', function (event) {
  event.preventDefault();

  let confirmation = false;
  const user = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);

  const accIndex = accounts.findIndex(acc => acc.userName === user);

  if (accIndex === -1 || accounts[accIndex]?.pin !== pin)
    alert('Enter Valid username and password');

  if (user !== currentAccount.userName)
    alert('You can only delete your own account 😒');
  else if (accIndex !== -1 && accounts[accIndex].pin === pin) {
    confirmation = confirm('Are you sure you want to close your account?');
    if (confirmation) {
      alert("It's sad that you are leaving us 😌");
      containerApp.style.opacity = 0;
      accounts.splice(accIndex, 1);
      inputCloseUsername.value = inputClosePin.value = '';
      inputClosePin.blur();
    }
  }
});
