document.addEventListener("DOMContentLoaded", function () {
    const calendar = document.getElementById("calendar");
    const holidaysSection = document.getElementById("holidays");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");

    let currentMonth = 0;

    function renderCalendar(year, month) {
        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay();

        let calendarHTML = `<table>
                            <tr>
                                <th colspan="7">${monthNames[month]} ${year}</th>
                            </tr>
                            <tr>
                                <th>D</th>
                                <th>S</th>
                                <th>T</th>
                                <th>Q</th>
                                <th>Q</th>
                                <th>S</th>
                                <th>S</th>
                            </tr>`;

        let dayCounter = 1;

        for (let i = 0; i < 6; i++) {
            calendarHTML += "<tr>";

            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDayOfWeek) {
                    calendarHTML += "<td></td>";
                } else if (dayCounter > daysInMonth) {
                    calendarHTML += "<td></td>";
                } else {
                    const date = new Date(year, month, dayCounter);
                    const isHoliday = isHolidayBrazil(date); // Função para verificar se é feriado
                    const storedActivities = JSON.parse(localStorage.getItem(`${year}-${month}-${dayCounter}`));
                    let activitiesHTML = '';
                    if (storedActivities) {
                        activitiesHTML = storedActivities.map((activity, index) => {
                            return `<div class="stored-activity" data-index="${index}">
                                        <span class="activity-hour">${activity.hour}h:</span>
                                        <span class="activity-text">${activity.activity}</span>
                                        <button class="edit-activity-btn">Editar</button>
                                        <button class="remove-activity-btn">Remover</button>
                                    </div>`;
                        }).join('');
                    }
                    calendarHTML += `<td class="${isHoliday ? 'holiday' : ''}" data-day="${dayCounter}">
                                        <div class="activity-container" style="display: none;">
                                            <input type="text" class="activity-input" placeholder="Atividade">
                                            <select class="hour-selector">
                                                ${generateHourOptions()}
                                            </select>
                                            <button class="add-activity-btn">Adicionar</button>
                                        </div>
                                        ${dayCounter}
                                        <br>
                                        <div class="stored-activities">${activitiesHTML}</div>
                                        <button class="show-activity-btn transparent-btn">+</button>
                                    </td>`;
                    dayCounter++;
                }
            }

            calendarHTML += "</tr>";
        }

        calendarHTML += "</table>";

        calendar.innerHTML = calendarHTML;

        // Atualiza a lista de feriados do mês
        updateHolidaysList(year, month);
        addActivityListeners();
    }

    function updateCalendar() {
        renderCalendar(2024, currentMonth);
    }

    prevMonthBtn.addEventListener("click", function () {
        currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
        updateCalendar();
    });

    nextMonthBtn.addEventListener("click", function () {
        currentMonth = (currentMonth === 11) ? 0 : currentMonth + 1;
        updateCalendar();
    });

    // Função para verificar se uma data é feriado no Brasil
    function isHolidayBrazil(date) {
        const day = date.getDate();
        const month = date.getMonth() + 1; // Os meses em JavaScript começam do zero, então adicionamos 1
        const holidays = [
            "01/01", // Ano Novo
            "21/04", // Tiradentes
            "01/05", // Dia do Trabalho
            "07/09", // Independência do Brasil
            "12/10", // Dia de Nossa Senhora Aparecida
            "02/11", // Finados
            "15/11", // Proclamação da República
            "25/12"  // Natal
        ];
        const dateString = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
        return holidays.includes(dateString);
    }

    // Adiciona ouvintes de evento para adicionar atividades ao clicar em um dia
    function addActivityListeners() {
        const days = document.querySelectorAll('#calendar td[data-day]');
        days.forEach(day => {
            const showActivityBtn = day.querySelector('.show-activity-btn');
            const activityContainer = day.querySelector('.activity-container');
            const addActivityBtn = day.querySelector('.add-activity-btn');

            showActivityBtn.addEventListener('click', function () {
                showActivityBtn.style.display = 'none';
                activityContainer.style.display = 'block';
            });

            addActivityBtn.addEventListener('click', function () {
                const activityInput = day.querySelector('.activity-input');
                const hourSelector = day.querySelector('.hour-selector');
                const selectedHour = hourSelector.value;
                const activity = activityInput.value;
                if (activity.trim() !== '') {
                    const existingActivities = day.querySelector('.stored-activities');
                    const newActivity = { hour: selectedHour, activity: activity };
                    const storedActivities = JSON.parse(localStorage.getItem(`${2024}-${currentMonth}-${day.dataset.day}`)) || [];
                    storedActivities.push(newActivity);
                    localStorage.setItem(`${2024}-${currentMonth}-${day.dataset.day}`, JSON.stringify(storedActivities));
                    const activityHTML = `<div class="stored-activity">
                                            <span class="activity-hour">${selectedHour}h:</span>
                                            <span class="activity-text">${activity}</span>
                                            <button class="edit-activity-btn">Editar</button>
                                            <button class="remove-activity-btn">Remover</button>
                                        </div>`;
                    existingActivities.innerHTML += activityHTML;
                    showActivityBtn.style.display = 'inline-block';
                    activityContainer.style.display = 'none';
                    addActivityListeners(); // Adicionando ouvinte de evento para o novo botão de edição e remoção
                }
            });

            // Editar atividade existente
            const editActivityBtns = day.querySelectorAll('.edit-activity-btn');
            editActivityBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    const activityDiv = btn.parentElement;
                    const activityText = activityDiv.querySelector('.activity-text').innerText;
                    const activityHour = activityDiv.querySelector('.activity-hour').innerText.split('h')[0];
                    const activityInput = activityContainer.querySelector('.activity-input');
                    const hourSelector = activityContainer.querySelector('.hour-selector');

                    activityInput.value = activityText;
                    hourSelector.value = activityHour;

                    showActivityBtn.style.display = 'none';
                    activityContainer.style.display = 'block';

                    // Remover a atividade existente quando o usuário salvar a edição
                    activityDiv.remove();
                });
            });

            // Remover atividade existente
            const removeActivityBtns = day.querySelectorAll('.remove-activity-btn');
            removeActivityBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    const activityDiv = btn.parentElement;
                    const activityIndex = activityDiv.dataset.index;
                    const storedActivities = JSON.parse(localStorage.getItem(`${2024}-${currentMonth}-${day.dataset.day}`)) || [];
                    storedActivities.splice(activityIndex, 1);
                    localStorage.setItem(`${2024}-${currentMonth}-${day.dataset.day}`, JSON.stringify(storedActivities));
                    activityDiv.remove();
                });
            });
        });
    }

    // Gera as opções para o seletor de horas
    function generateHourOptions() {
        let options = '';
        for (let hour = 0; hour < 24; hour++) {
            options += `<option value="${hour}">${hour}:00</option>`;
        }
        return options;
    }

    // Atualiza a lista de feriados do mês
    function updateHolidaysList(year, month) {
        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        const holidays = {
            "01/01": "Ano Novo",
            "21/04": "Tiradentes",
            "01/05": "Dia do Trabalho",
            "07/09": "Independência do Brasil",
            "12/10": "Dia de Nossa Senhora Aparecida",
            "02/11": "Finados",
            "15/11": "Proclamação da República",
            "25/12": "Natal"
        };

        const holidaysList = [];

        for (const holiday in holidays) {
            const [holidayDay, holidayMonth] = holiday.split('/');
            if (parseInt(holidayMonth) === month + 1) {
                holidaysList.push(`${holidayDay} de ${monthNames[month]}: ${holidays[holiday]}`);
            }
        }

        const holidaysHTML = holidaysList.length > 0 ? "<h2>Feriados do Mês:</h2><ul><li>" + holidaysList.join("</li><li>") + "</li></ul>" : "<h2>Sem feriados neste mês.</h2>";

        holidaysSection.innerHTML = holidaysHTML;
    }

    updateCalendar();
});
