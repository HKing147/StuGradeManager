import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'

// import Users from '../components/user/User.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'

// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'

// import GoodsList from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'

// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'

// 路由懒加载
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/User.vue')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

const GoodsList = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/List.vue')
const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/Add.vue')

const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')
// 自己写的
/* 创建 */
const CreateCollege = () => import(/* webpackChunkName: "Create" */ '../components/Create/CreateCollege')
const CreateDepartment = () => import(/* webpackChunkName: "Create" */ '../components/Create/CreateDepartment')
const CreateJiaoYan = () => import(/* webpackChunkName: "Create" */ '../components/Create/CreateJiaoYan')
const CreateClass = () => import(/* webpackChunkName: "Create" */ '../components/Create/CreateClass')
/* 录入 */
const InputTea = () => import(/* webpackChunkName: "Input" */ '../components/Input/InputTea')
const InputStu = () => import(/* webpackChunkName: "Input" */ '../components/Input/InputStu')
const InputCou = () => import(/* webpackChunkName: "Input" */ '../components/Input/InputCou')
const InputTeaCou = () => import(/* webpackChunkName: "Input" */ '../components/Input/InputTeaCou')
const InputClassCou = () => import(/* webpackChunkName: "Input" */ '../components/Input/InputClassCou')
const InputGrade = () => import(/* webpackChunkName: "Input" */ '../components/Input/InputGrade')
/* 查询 */
const QueryGradeByClass = () => import(/* webpackChunkName: "Query" */ '../components/Query/QueryGradeByClass')
const QuerySum = () => import(/* webpackChunkName: "Query" */ '../components/Query/QuerySum')
const QueryRank = () => import(/* webpackChunkName: "Query" */ '../components/Query/QueryRank')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home',
    component: Home,
    redirect: '/Welcome',
    children: [
      { path: '/home', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report },
      // 自己写的
      /* 创建 */
      { path: '/CreateCollege', component: CreateCollege },
      { path: '/CreateDepartment', component: CreateDepartment },
      { path: '/CreateJiaoYan', component: CreateJiaoYan },
      { path: '/CreateClass', component: CreateClass },
      /* 录入 */
      { path: '/InputTea', component: InputTea },
      { path: '/InputStu', component: InputStu },
      { path: '/InputCou', component: InputCou },
      { path: '/InputTeaCou', component: InputTeaCou },
      { path: '/InputClassCou', component: InputClassCou },
      { path: '/InputGrade', component: InputGrade },
      /* 查询 */
      { path: '/QueryGradeByClass', component: QueryGradeByClass },
      { path: '/QuerySum', component: QuerySum },
      { path: '/QueryRank', component: QueryRank }
    ] }

]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫,to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作 next('/login')强制跳转login
router.beforeEach((to, from, next) => {
  // 访问登录页，放行
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token, 强制跳转到登录页
  if (!tokenStr) return next('/login')
  next()
})
export default router
