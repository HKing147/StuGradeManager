<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>教师管理</el-breadcrumb-item>
      <el-breadcrumb-item>教师列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索 添加 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getTeacherList">
            <el-button slot="append" icon="el-icon-search" @click="getTeacherList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="CreateDialogVisible = true">创建教师</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="TeacherList" border stripe>
        <!-- stripe: 斑马条纹
        border：边框-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="tid" label="教师编号"></el-table-column>
        <el-table-column prop="tname" label="教师名称"></el-table-column>
        <el-table-column prop="trank" label="教师等级"></el-table-column>
        <el-table-column prop="jname" label="所属教研室"></el-table-column>
        <!-- <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column> -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              circle
              @click="showEditDialog(scope.row.tid)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              @click="delTeacher(scope.row.tid)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="角色分配"
              :enterable="false"
              placement="top"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                circle
                @click="showSetRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 创建教师的对话框 -->
    <el-dialog title="创建教师" :visible.sync="CreateDialogVisible" width="50%" @close="CreateDialogClosed">
      <!-- 内容主体 -->
      <el-form
        :model="CreateTeacherForm"
        ref="CreateTeacherFormRef"
        label-width="100px"
      >
      <!-- <el-form
        :model="CreateTeacherForm"
        ref="CreateTeacherFormRef"
        :rules="CreateTeacherFormRules"
        label-width="100px"
      > -->
        <el-form-item label="教师编号" prop="tid">
          <el-input v-model="CreateTeacherForm.tid"></el-input>
        </el-form-item>
        <el-form-item label="教师名" prop="tname">
          <el-input v-model="CreateTeacherForm.tname"></el-input>
        </el-form-item>
        <el-form-item label="教师等级" prop="trank">
          <el-input v-model="CreateTeacherForm.trank"></el-input>
        </el-form-item>
        <el-form-item label="所属教研室" prop="jname">
          <el-input v-model="CreateTeacherForm.jname"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="CreateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="CreateTeacher">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改教师的对话框 -->
    <el-dialog
      title="修改教师信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体 -->
      <el-form
        :model="ModifyTeacherForm"
        ref="ModifyTeacherFormRef"
        label-width="100px"
      >
      <!-- <el-form
        :model="ModifyTeacherForm"
        ref="ModifyTeacherFormRef"
        :rules="ModifyTeacherFormRules"
        label-width="100px"
      > -->
        <el-form-item label="教师编号" pro="tid">
          <el-input v-model="ModifyTeacherForm.tid" disabled></el-input>
        </el-form-item>
        <el-form-item label="教师名" prop="tname">
          <el-input v-model="ModifyTeacherForm.tname"></el-input>
        </el-form-item>
        <el-form-item label="教师等级" prop="trank">
          <el-input v-model="ModifyTeacherForm.trank"></el-input>
        </el-form-item>
        <el-form-item label="所属教研室" prop="jname">
          <el-input v-model="ModifyTeacherForm.jname"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="ModifyTeacher">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>
          分配角色：
          <el-select
            v-model="selectRoleId"
            filterable
            allow-create
            default-first-option
            placeholder="请选择文章标签"
          >
            <el-option
              v-for="item in rolesLsit"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import axios from 'axios'
export default {
  data () {
    // 自定义邮箱规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        // 合法邮箱
        return callback()
      }
      callback(new Error('请输入合法邮箱'))
    }
    // 自定义手机号规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      // 返回一个错误提示
      callback(new Error('请输入合法的手机号码'))
    }
    return {
      // 获取用户列表查询参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页显示多少数据
        pagesize: 5
      },
      TeacherList: [],
      total: 0,
      // 创建教师对话框
      CreateDialogVisible: false,
      // 用户添加
      CreateTeacherForm: {
        tid: '',
        tname: '',
        jname: ''
        // mobile: ''
      },
      // 用户添加表单验证规则
      CreateTeacherFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '用户名的长度在2～10个字',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          {
            min: 6,
            max: 18,
            message: '用户密码的长度在6～18个字',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改教师
      editDialogVisible: false,
      ModifyTeacherForm: {},
      // 编辑用户表单验证
      ModifyTeacherFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 分配角色对话框
      setRoleDialogVisible: false,
      // 当前需要被分配角色的用户
      userInfo: {},
      // 所有角色数据列表
      rolesLsit: [],
      // 已选中的角色Id值
      selectRoleId: ''
    }
  },
  created () {
    this.getTeacherList()
  },
  methods: {
    async getTeacherList () {
      const { data: res } = await this.$http.get('getTeacherList', { params: this.queryInfo })
      // const { data: res } = await axios.get('http://10.102.101.75:1234/getTeacherList/', {
      //   params: this.queryInfo
      // })
      // axios.get('http://127.0.0.1:1234/us')
      // const { data: res } = await this.$http.get('users', {
      //   params: this.queryInfo
      // })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      console.log(res)
      this.TeacherList = res.data.TeacherList
      this.total = res.data.total
      // console.log(this.TeacherList)
    },
    // 监听 pagesize改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getTeacherList()
    },
    // 监听 页码值 改变事件
    handleCurrentChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagenum = newSize
      this.getTeacherList()
    },
    // 监听 switch开关 状态改变
    async userStateChanged (userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听 创建教师对话框的关闭事件
    CreateDialogClosed () {
      this.$refs.CreateTeacherFormRef.resetFields()
    },
    // 创建教师
    CreateTeacher () {
      // 提交请求前，表单预验证
      this.$refs.CreateTeacherFormRef.validate(async valid => {
        // console.log(valid)
        // 表单预校验失败
        if (!valid) return
        const { data: res } = await this.$http.get('CreateTeacher', { params: this.CreateTeacherForm })
        // const { data: res } = await axios.get('http://localhost:1234/CreateTeacher/', {
        //   params: this.CreateTeacherForm
        // })
        if (res.meta.status === 200) {
          this.$message.success('创建教师成功！')
        } else {
          this.$message.error('创建教师失败！')
        }
        // 隐藏创建教师对话框
        this.CreateDialogVisible = false
        this.getTeacherList()
      })
    },
    // 编辑用户信息
    async showEditDialog (tid) {
      // const { data: res } = await this.$http.get('users/' + tid)
      // const { data: res } = await axios.get('http://localhost:1234/CreateTeacher/', {
      //   params: this.CreateTeacherForm
      // })
      // if (res.meta.status !== 200) {
      //   return this.$message.error('查询用户信息失败！')
      // }
      this.ModifyTeacherForm.tid = tid
      this.editDialogVisible = true
    },
    // 监听修改教师对话框的关闭事件
    editDialogClosed () {
      this.$refs.ModifyTeacherFormRef.resetFields()
    },
    // 修改教师信息
    ModifyTeacher () {
      // 提交请求前，表单预验证
      this.$refs.ModifyTeacherFormRef.validate(async valid => {
        // console.log(valid)
        // 表单预校验失败
        if (!valid) return
        // const { data: res } = await this.$http.put(
        //   'ModifyTeacher/' + this.ModifyTeacherForm
        // )
        const { data: res } = await this.$http.get('ModifyTeacher', { params: this.ModifyTeacherForm })
        // const { data: res } = await axios.get('http://localhost:1234/ModifyTeacher/', {
        //   params: this.ModifyTeacherForm
        // })
        if (res.meta.status !== 200) {
          this.$message.error('修改教师信息失败！')
        } else {
          this.$message.success('修改教师信息成功！')
        }
        // 隐藏创建教师对话框
        this.editDialogVisible = false
        this.getTeacherList()
      })
    },
    // 删除教师
    async delTeacher (tid) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该教师, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 点击确定 返回值为：confirm
      // 点击取消 返回值为： cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.get('delTeacher', { params: { 'tid': tid } })
      // const { data: res } = await axios.get('http://localhost:1234/delTeacher/', {
      //   params: { 'tid': tid }
      // })
      if (res.meta.status !== 200) return this.$message.error('删除教师失败！')
      this.$message.success('删除教师成功！')
      this.getTeacherList()
    },
    // 展示分配角色的对话框
    async showSetRole (role) {
      this.userInfo = role
      // 展示对话框之前，获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesLsit = res.data
      this.setRoleDialogVisible = true
    },
    // 分配角色
    async saveRoleInfo () {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('更新用户角色失败！')
      }
      this.$message.success('更新角色成功！')
      this.getTeacherList()
      this.setRoleDialogVisible = false
    },
    // 分配角色对话框关闭事件
    setRoleDialogClosed () {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
</style>
