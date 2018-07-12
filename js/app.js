
Vue.component('weather-icon', {
	props: [ 'name', 'size' ],
	data: function() {
		return {
			base: 'https://www.metaweather.com/static/img/weather/',
			file: ''
		}
	},
	mounted: function () {
		this.file = this.name;
	},
	template: `<img :src="base + name + '.svg'" :width="size">`
});

Vue.component('weather', {
	props: [ 'woeid', 'alldates' ],
	data: function() {
		return {
			detail: {
				city: 'Loading...',
				temp: {
					weather_state_abbr: 's',
					weather_state_name: '',
					the_temp: '',
					min_temp: '',
					max_temp: ''
				}
			},
			loaded: false,
			error: ''
		}
	},
	computed: {
		boxCursorStyle: function() {
			if (typeof(this.alldates) != 'undefined' && this.alldates === true)
			{
				// if we are on the single page already, don't show a ppinter cursor
				return { cursor: 'default' }
			}
			return { cursor: 'pointer' }
		}
	},
	methods: {
		gotoDetails: function(){
			if (typeof(this.alldates) != 'undefined' && this.alldates === true)
			{
				// if we are on the single page already, do nothing..
				return false;
			} else {
				router.replace('/weather/'+this.woeid);
			}
		},
		getDay: function(date){
			var weekday = new Array(7);
				weekday[0] =  "Sunday";
				weekday[1] = "Monday";
				weekday[2] = "Tuesday";
				weekday[3] = "Wednesday";
				weekday[4] = "Thursday";
				weekday[5] = "Friday";
				weekday[6] = "Saturday";

				var dateObject = new Date(date);

				if (dateObject)
				{
					return weekday[dateObject.getDay()];
				}
				return date;
		},
		loadWeathers: function() {
			var self = this;
			this.$http.get('http://www.zubair.info/weather.php?command=location&woeid='+self.woeid).then(function(response)
			{
				if(response.status == "200")
				{
					self.detail.city = response.body.title;
					if (typeof(this.alldates) != 'undefined' && this.alldates === true)
					{
						self.detail.temp = response.body.consolidated_weather;
					} else {
						self.detail.temp = response.body.consolidated_weather[0]; // The first item has data for today
					}
					this.loaded = true;
				}

			}, function(response)
			{
				this.loaded = false;

				if (response.status == '404')
				{
					this.error = 'No results were found.';
				} else {
					this.error = response.statusText;
				}
			});
		}
	},
	mounted: function () {
		this.loadWeathers();
	},
	template: `
		<div class="col-12 col-sm-4 mt-3" v-if="loaded">
			<div class="row">
				<div class="col">
					<div class="border" :style=[boxCursorStyle] v-on:click="gotoDetails">
						<div class="row mt-1 mb-1 ml-1 mr-1 border-bottom">
							<div class="col-9">
								<h3>{{ detail.city }}</h3>
							</div>
							<div class="col-3 small text-right">
								<div class="mt-2">#{{ woeid }}</div>
							</div>
						</div>

						<div class="row mt-3 mb-3 ml-1 mr-1" v-if="alldates">
							<div class="col-12 small">
								<div class="border mb-2" v-for="item in detail.temp" v-bind:key="item.woeid" v-bind:woeid="item.woeid">
									<div class="row">
										<div class="col-12">
											<h6 class="mt-2 ml-2"><b>{{ getDay(item.applicable_date) }}</b></h6>
											<hr />
										</div>
									</div>
									<div class="row">
										<div class="col-9">
											<div class="pb-2 pl-2">
												<div><b>Temp: {{ item.the_temp }}</b></div>
												<div>Min Temp: {{ item.min_temp }}</div>
												<div>Max Temp: {{ item.max_temp }}</div>
											</div>
										</div>
										<div class="col-3">
											<weather-icon :name="item.weather_state_abbr" size="90%"></weather-icon>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="row mt-3 mb-3 ml-1 mr-1" v-else>
							<div class="col-8 small">
								<div><b>Temp: {{ detail.temp.the_temp }}</b></div>
								<div>Min Temp: {{ detail.temp.min_temp }}</div>
								<div>Max Temp: {{ detail.temp.max_temp }}</div>
							</div>
							<div class="col">
								<weather-icon :name="detail.temp.weather_state_abbr" size="90%"></weather-icon>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="col-12 col-sm-4 mt-3" v-else>
			<div class="row">
				<div class="col">
					<div style="text-align: center; line-height: 150px;" class="border" v-if="error == false">Loading..</div>
					<div style="text-align: center; line-height: 125px;" class="alert alert-danger" v-else>{{ error }}</div>
				</div>
			</div>
		</div>
	`
})

const Home = {
	data: function() {
		return {
		}
	},
	computed: {
		default_cities: function() {
			return [
				{"title":"Istanbul", "woeid":2344116},
				{"title":"Berlin", "woeid":638242},
				{"title":"London", "woeid":44418},
				{"title":"Helsinki", "woeid":565346},
				{"title":"Dublin", "woeid":560743},
				{"title":"Vancouver", "woeid":9807}
			]
		}
	},
	template: `
		<div class="row">
			<weather
				v-for="city in default_cities"
				v-bind:key="city.woeid"
				v-bind:woeid="city.woeid"
			></weather>
		</div>
	`
}
const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }
const Search = {
	props: ['keyword'],
	data: function() {
		return {
			result: [],
			loaded: false,
			empty: true,
			error: ''
		}
	},
	methods: {
		submitSearch: function() {
			if (this.txtKeyword.length > 0)
			{
				router.replace('/search/'+this.txtKeyword, function(){
					this.doSearch();
				});
			}
		},
		doSearch: function() {
			var self = this;
			this.$http.get('http://www.zubair.info/weather.php?command=search&keyword='+self.keyword).then(function(response)
			{
				if(response.status == "200")
				{
					this.result = response.body;

					if (this.result.length > 0)
					{
						this.loaded = true;
						this.empty = false;
					} else {
						this.loaded = true;
						this.empty = true;
						this.error = 'No results were found.';
					}
				}
			}, function(response)
			{
				this.loaded = false;

				if (response.status == '404')
				{
					this.error = 'No results were found.';
				} else {
					this.error = response.statusText;
				}
			});
		}
	},
	watch: {
		// Call again if the route changes
		'$route': 'doSearch'
	},
	mounted: function() {
		this.doSearch();
	},
	template: `
		<div class="row">
			<div class="col">
				<div class="row mb-5">
					<div class="col">
						<em>Searching for "{{ keyword }}"..</em>
					</div>
				</div>
				<div class="row" v-if="loaded">
						<weather
							v-for="city in result"
							v-bind:key="city.woeid"
							v-bind:woeid="city.woeid"
						></weather>
				</div>
				<div class="row" v-else>
					<div class="col">
						Searching..
					</div>
				</div>

				<div class="row" v-if="error">
					<div class="col">
						<div class="alert alert-danger">{{ error }}</div>
					</div>
				</div>

			</div>
		</div>
	`
}
const WeatherSingePage = {
	props: ['woeid'],
	data: function() {
		return {
			result: [],
			loaded: false,
			empty: true
		}
	},
	methods: {
	},
	mounted: function() {
		var woeid = Number(this.woeid);
		if (woeid)
		{
			this.result.push({'woeid': woeid});

			if (this.result.length > 0)
			{
				this.load = true;
				this.empty = false;
			}
		}
	},
	template: `
		<div class="row">
			<div class="col">
				<div class="row mb-5">
					<div class="col">
						<em>Fetching details for "{{ woeid }}"..</em>
					</div>
				</div>
				<div class="row" v-if="empty === false">
						<weather
							v-for="city in result"
							v-bind:key="city.woeid"
							v-bind:woeid="city.woeid"
							v-bind:alldates="true"
						></weather>
				</div>
				<div class="row" v-else>
					<div class="col">
						<div class="alert alert-danger">No results were found</div>
					</div>
				</div>
			</div>
		</div>
	`
}

var router = new VueRouter({
	routes: [
		{ path: '/', component: Home },
		{ path: '/search', component: Search },
		{
			path: '/search/:keyword',
			component: Search,
			props: true
		},
		{
			path: '/weather/:woeid',
			component: WeatherSingePage,
			props: true
		}
	]
});

const app = new Vue({
	el: '#app',
	data: {
		txtKeyword: ''
	},
	methods: {
		submitSearch: function() {
			if (this.txtKeyword.length > 0)
			{
				router.replace('/search/'+this.txtKeyword);
			}
		}
	},
	router: router,
	/*template: `
				<div class="row">
					<div class="col-9">
						<h2><b>Today's Weather</b></h2>
					</div>
					<div class="col-3">
						<nav class="mt-2 text-right">
							<router-link to="/" class="btn btn-primary btn-sm">Home</router-link>
							<router-link to="/search" class="btn btn-default btn-sm">Search</router-link>

							<router-link to="/" class="btn btn-default btn-sm">/</router-link>
							<router-link to="/foo" class="btn btn-default btn-sm">/foo</router-link>
							<router-link to="/bar" class="btn btn-default btn-sm">/bar</router-link>
						</nav>
					</div>
				</div>

				<hr>
				
				<div class="row">
					<weather
						v-for="city in default_cities"
						v-bind:key="city.id"
						v-bind:title="city.title"
						v-bind:woeid="city.woeid"
						:home_item_counter="home_item_counter++"
					></weather>
				</div>
	`*/
});