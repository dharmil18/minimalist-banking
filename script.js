'use strict';

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-04-16T17:01:17.194Z',
    '2021-04-15T23:36:17.929Z',
    '2021-04-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

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

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  else if (daysPassed === 1) return 'Yesterday';
  else if (daysPassed <= 7) return `${daysPassed} days ago`;
  return Intl.DateTimeFormat(locale).format(date);
};

const formattedCurrency = function (value, locale, currency) {
  const options = {
    style: 'currency',
    currency: currency,
    useGrouping: true,
  };
  return new Intl.NumberFormat(locale, options).format(value);
};

const startLogOutTimer = function () {
  const tick = function () {
    const mins = String(Math.trunc(time / 60)).padStart(2, 0);
    const secs = String(Math.trunc(time % 60)).padStart(2, 0);

    //Display mins and secs in UI
    labelTimer.textContent = `${mins}:${secs}`;

    //Log out user once time becomes zero. hide UI
    if (time === 0) {
      clearInterval(timer);
      currentAccount = undefined;
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    //Decrease time
    time--;
  };

  //Set time to 5 mins in seconds
  let time = 5 * 60;

  //Call SetInterval() to decrease time by 1 every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//-> Setting up the movements (transactions) dynamically from the account data

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach((value, index) => {
    const movementType = value > 0 ? 'deposit' : 'withdrawal';
    let date = new Date(account.movementsDates[index]);
    let displayDate = formatMovementDate(date, account.locale);

    const formattedMovement = formattedCurrency(
      value.toFixed(2),
      account.locale,
      account.currency
    );

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${movementType}">${
      index + 1
    } ${movementType}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMovement}</div>
        </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
const calculateDisplayFinalBalance = function (account) {
  account.balance = account.movements.reduce(
    (accumulator, movement) => accumulator + movement
  );
  const formattedBalance = formattedCurrency(
    account.balance,
    account.locale,
    account.currency
  );
  labelBalance.textContent = `${formattedBalance}`;
};

const calcDisplaySummary = function (account) {
  const income = account.movements
    .filter(movement => movement > 0)
    .reduce((accumulator, movement) => accumulator + movement);
  const formattedIncome = formattedCurrency(
    income.toFixed(2),
    account.locale,
    account.currency
  );
  labelSumIn.textContent = `${formattedIncome}`;

  const outgoing = account.movements
    .filter(movement => movement < 0)
    .reduce((accumulator, movement) => accumulator + movement);
  const formattedOutgoing = formattedCurrency(
    Math.abs(outgoing.toFixed(2)),
    account.locale,
    account.currency
  );
  labelSumOut.textContent = `${formattedOutgoing}`;

  const interest = account.movements
    .filter(movement => movement > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((accumulator, interest) => accumulator + interest);

  const formattedInterest = formattedCurrency(
    interest.toFixed(2),
    account.locale,
    account.currency
  );

  labelSumInterest.textContent = `${formattedInterest}`;
};

//Event Handlers
let currentAccount = '';
let timer;

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

    //Creating current date and time
    const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const mins = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${mins}`;
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    //Set Opacity to 100
    containerApp.style.opacity = 100;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Start LogOut Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

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
    receiverAcc.movementsDates.push(new Date().toISOString());
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    alert('Money Transfered Successfully 🎉');
    updateUI(currentAccount);

    //Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }

  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();
});

btnLoan.addEventListener('click', function (event) {
  event.preventDefault();
  const loanAmount = Math.floor(Number(inputLoanAmount.value));

  if (
    loanAmount > 0 &&
    currentAccount.movements.some(movment => movment >= loanAmount * 0.1)
  ) {
    setTimeout(function () {
      currentAccount.movements.push(loanAmount);
      currentAccount.movementsDates.push(new Date().toISOString());
      alert('Congratulations, loan approved 🎉');
      updateUI(currentAccount);
    }, 3000);
  } else if (loanAmount <= 0) alert('Loan Amount must be greater than zero 😒');
  else {
    alert('Loan Amount cannot be approved. Contact Manager 👨‍💼');
  }

  inputLoanAmount.value = '';
  inputLoanAmount.blur();

  //Reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
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

let sortState = false;
btnSort.addEventListener('click', function (event) {
  event.preventDefault();

  displayMovements(currentAccount, !sortState);
  sortState = !sortState;
});
