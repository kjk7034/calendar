(function (window) {
	const helper = {
		date: {
			getDayCount(y, m, d) {
				const newdate = new Date(y, m - 1, d)
				return newdate.getDay();
			},
			getMonthLastDay(y, m) {
				return (new Date(y, m, 0).getDate())
			},
			getMonthDate(y, m, diff) {
				var date = new Date(y, m - 1, 1);
				date.setMonth(date.getMonth() + diff);
				return date;
			},
			isToday(y, m, d) {
				const now = new Date();
				return (y === now.getFullYear() && m === now.getMonth() + 1 && d === now.getDate()) ? true : false
			},
			getFullDate(y, m, d) {
				const year = String(y),
					month = String(m),
					date = String(d);
				let returnText = year
				if (Number(month) > 9) {
					returnText += month
				} else {
					returnText += "0" + month
				}
				if (Number(date) > 9) {
					returnText += date
				} else {
					returnText += "0" + date
				}
				return String(returnText)
			},
			isPrevDay(ymd) {
				const now = new Date();
				const today = Number(this.getFullDate(now.getFullYear(), now.getMonth() + 1, now.getDate()))
				if (Number(ymd) - today < 0) {
					return true
				} else {
					return false
				}
			}
		}
	}
	class ScheduleModel {
		constructor() {
			this.schedule = new Map()
		}
		getSchedule(key) {
			return this.schedule.get(key)
		}
		setSchedule(key, value) {
			this.schedule.set(key, value)
		}
		deleteSchedule(key) {
			this.schedule.delete(key)
		}
		hasSchedule(key) {
			return this.schedule.has(key)
		}
	}
	class Model extends ScheduleModel {
		constructor(options) {
			super()
			this.getDays = this.getDays
			this.setDays = this.setDays
			this.monthDate = options.setDate
			this.init(options)
		}
		init(options) {
			// 받은 스케쥴 데이터가 있는 경우
			if (options.schedule) {
				options.schedule.forEach((item) => {
					this.setSchedule(item.date, { message: item.message })
				})
			}
			this.setDays()
		}
		setDays() {
			let returnData = []
			// 선택월 이전달 마지막
			const prevMonth = helper.date.getMonthDate(this.monthDate.year, this.monthDate.month, -1);
			const currentMonthStartDayCount = helper.date.getDayCount(this.monthDate.year, this.monthDate.month, 1);
			const prevMonthLastDay = helper.date.getMonthLastDay(prevMonth.getFullYear(), prevMonth.getMonth() + 1);

			for (let i = currentMonthStartDayCount; i > 0; i--) {
				returnData.push({
					year: prevMonth.getFullYear(),
					month: prevMonth.getMonth() + 1,
					date: prevMonthLastDay - i + 1,
					className: helper.date.isToday(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonthLastDay - i) ? "prev today" : "prev"
				})
			}
			// 선택월
			const currentMonthLastDay = helper.date.getMonthLastDay(this.monthDate.year, this.monthDate.month);
			for (let i = 1; i <= currentMonthLastDay; i++) {
				returnData.push({
					year: this.monthDate.year,
					month: this.monthDate.month,
					date: i,
					className: helper.date.isToday(this.monthDate.year, this.monthDate.month, i) ? "normal today" : "normal"
				})
			}
			// 선택월 다음달 초
			const nextMonth = helper.date.getMonthDate(this.monthDate.year, this.monthDate.month, 1);
			const currentMonthEndDayCount = helper.date.getDayCount(this.monthDate.year, this.monthDate.month, currentMonthLastDay);
			for (let i = 1; i < 7 - currentMonthEndDayCount; i++) {
				returnData.push({
					year: nextMonth.getFullYear(),
					month: nextMonth.getMonth() + 1,
					date: i,
					className: helper.date.isToday(nextMonth.getFullYear(), nextMonth.getMonth() + 1, i) ? "prev today" : "prev"
				})
			}
			this.days = returnData
		}
		getDays() {
			return this.days
		}
		setMonthDate(setDate) {
			this.monthDate = setDate
		}
	}

	class View {
		constructor(model, options) {
			this.model = model
			this.options = options
			this.days = model.days
			this.init()
		}
		init() {
			const targetEl = document.querySelector(`#${this.options.id}`),
				$table = document.createElement("table");
			$table.setAttribute("id", this.options.tableId);
			$table.innerHTML = `
            <thead>
                <tr>
                    <th colspan="7">${this.options.setDate.year}-${this.options.setDate.month}</th>
                </tr>
                <tr>
                    <th>일</th>
                    <th>월</th>
                    <th>화</th>
                    <th>수</th>
                    <th>목</th>
                    <th>금</th>
                    <th>토</th>
                </tr>
            </thead>
        `;
			targetEl.appendChild($table)
		}
		render() {
			const $table = document.querySelector(`#${this.options.tableId}`),
				tbody = $table.querySelector("tbody");
			if (tbody) {
				$table.removeChild(tbody)
				$table.appendChild(this.renderTBody())
			} else {
				$table.appendChild(this.renderTBody())
			}
		}
		removeLayer() {
			const targetEl = document.querySelector(`#${this.options.id}`),
				layerEl = document.getElementById(this.options.layerId);
			targetEl.removeChild(layerEl)
		}
		appendLayer(target) {
			const targetEl = document.querySelector(`#${this.options.id}`),
				$layer = document.createElement("div"),
				date = target.getAttribute("data-date"),
				message = this.model.hasSchedule(date) ? this.model.getSchedule(date).message : "";
			$layer.setAttribute("id", this.options.layerId);
			$layer.innerHTML = `
                <p>${date}</p>
                <input type="text" class="calendar-input-date" value="${message}" />
                <div class="calendar-layer-btns">
                <button type="button" class="${message === "" ? "btn-add" : "btn-modify"}">${message === "" ? "등록" : "수정"}</button>
                ${message !== "" ? "<button type='button' class='btn-delete'>삭제</button>" : ""}
                <button type="button" class="btn-close">닫기</button>
                </div>
            `
			targetEl.appendChild($layer)
		}
		renderMessageView(dataDate) {
			return this.model.hasSchedule(dataDate) ? `<div class="message">${this.model.getSchedule(dataDate).message}</div>` : ""
		}
		renderTBody() {
			const $tbody = document.createElement("tbody");
			let returnHtml = ""
			this.days.forEach((item, idx) => {
				const dataDate = helper.date.getFullDate(item.year, item.month, item.date);
				if (idx % 7 === 0) {
					returnHtml += `<tr>`
				}
				returnHtml += `<td data-date="${dataDate}" class="${item.className}">${item.date}${this.renderMessageView(dataDate)}</td>`
				if (idx % 7 === 6) {
					returnHtml += `</tr>`
				}
			})
			$tbody.innerHTML = returnHtml
			return $tbody
		}
	}
	class Calendar {
		constructor(props) {
			const now = new Date(),
				defaults = {
					setDate: {
						year: now.getFullYear(),
						month: now.getMonth() + 1,
						date: now.getDate()
					},
					layerId: "calendar-layer",
					tableId: "calendar-table",
					selectClass: "selected",
					weekdays: ["일", "월", "화", "수", "목", "금", "토"],
					months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],

				},
				options = Object.assign({}, defaults, props)
			this.Model = new Model(options)
			this.View = new View(this.Model, options)
			this.View.render()
			this.events().init(options)
		}
		events() {
			return {
				init: (options) => {
					const $tdList = document.querySelectorAll("[data-date]")
					$tdList.forEach((el) => {
						el.addEventListener("click", (e) => {
							const selectDom = document.querySelector(`.${options.selectClass}`),
								layerDom = document.querySelector(`#${options.layerId}`),
								target = e.target.nodeName.toLocaleLowerCase() === "td" ? e.target : e.target.parentNode,
								currentDate = target.getAttribute("data-date");

							if (helper.date.isPrevDay(currentDate)) {
								alert("이전 날은 입력이 불가능합니다.")
								return
							}
							if (selectDom) {
								document.querySelector(`.${options.selectClass}`).classList.remove(options.selectClass);
							}
							target.classList.add(options.selectClass);
							if (layerDom) {
								this.View.removeLayer()
							}
							this.View.appendLayer(target)
							this.events().layerEvents(target)
						});
					});
				},
				layerEvents: (target) => {
					const date = target.getAttribute("data-date");
					document.querySelector(".calendar-layer-btns").addEventListener("click", (e) => {
						const inputText = document.querySelector(".calendar-input-date").value.trim()
						switch (e.target.className) {
							case "btn-add":
								this.Model.setSchedule(date, {
									message: inputText
								})
								alert("등록되었습니다.")
								const $addMessage = document.createElement("span");
								$addMessage.className = "message"
								$addMessage.innerHTML = `${inputText}`
								target.appendChild($addMessage)
								this.View.removeLayer()
								break;
							case "btn-modify":
								this.Model.setSchedule(date, {
									message: inputText
								})
								alert("수정되었습니다.")
								target.querySelector(".message").innerText = `${inputText}`
								this.View.removeLayer()
								break;
							case "btn-delete":
								this.Model.deleteSchedule(date)
								alert("삭제했습니다.")
								target.removeChild(target.querySelector(".message"))
								this.View.removeLayer()
								break;
							case "btn-close":
								this.View.removeLayer()
								break;
						}
					}, true);
				}
			}
		}
	}
	window.Calendar = Calendar
})(window)
