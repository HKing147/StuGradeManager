<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>班级管理</el-breadcrumb-item>
      <el-breadcrumb-item>班级列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索 添加 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getClassList">
            <el-button slot="append" icon="el-icon-search" @click="getClassList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="CreateDialogVisible = true">创建班级</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="ClassList" border stripe :default-sort = "{prop: 'cid', order: 'ascending'}">
        <!-- stripe: 斑马条纹
        border：边框-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="cid" label="班级编号" sortable></el-table-column>
        <el-table-column prop="cname" label="班级名称" sortable></el-table-column>
        <!-- <el-table-column prop="jcharge" label="班级负责人"></el-table-column> -->
        <el-table-column prop="dname" label="所属系" sortable></el-table-column>
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
              @click="showEditDialog(scope.row.cid)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              @click="delClass(scope.row.cid)"
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

    <!-- 创建班级的对话框 -->
    <el-dialog title="创建班级" :visible.sync="CreateDialogVisible" width="50%" @close="CreateDialogClosed">
      <!-- 内容主体 -->
      <el-form
        :model="CreateClassForm"
        ref="CreateClassFormRef"
        label-width="100px"
      >
      <!-- <el-form
        :model="CreateClassForm"
        ref="CreateClassFormRef"
        :rules="CreateClassFormRules"
        label-width="100px"
      > -->
        <el-form-item label="班级编号" prop="cid">
          <el-input v-model="CreateClassForm.cid"></el-input>
        </el-form-item>
        <el-form-item label="班级名" prop="cname">
          <el-input v-model="CreateClassForm.cname"></el-input>
        </el-form-item>
        <!-- <el-form-item label="班级负责人" prop="jcharge">
          <el-input v-model="CreateClassForm.jcharge"></el-input>
        </el-form-item> -->
        <el-form-item label="所属系" prop="dname">
          <el-input v-model="CreateClassForm.dname"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="CreateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="CreateClass">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改班级的对话框 -->
    <el-dialog
      title="修改班级信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体 -->
      <el-form
        :model="ModifyClassForm"
        ref="ModifyClassFormRef"
        label-width="100px"
      >
      <!-- <el-form
        :model="ModifyClassForm"
        ref="ModifyClassFormRef"
        :rules="ModifyClassFormRules"
        label-width="100px"
      > -->
        <el-form-item label="班级编号" pro="cid">
          <el-input v-model="ModifyClassForm.cid" disabled></el-input>
        </el-form-item>
        <el-form-item label="班级名" prop="cname">
          <el-input v-model="ModifyClassForm.cname"></el-input>
        </el-form-item>
        <!-- <el-form-item label="班级负责人" prop="jcharge">
          <el-input v-model="ModifyClassForm.jcharge"></el-input>
        </el-form-item> -->
        <el-form-item label="所属系" prop="dname">
          <el-input v-model="ModifyClassForm.dname"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="ModifyClass">确 定</el-button>
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
      ClassList: [],
      total: 0,
      // 创建班级对话框
      CreateDialogVisible: false,
      // 用户添加
      CreateClassForm: {
        cid: '',
        cname: '',
        dname: ''
        // mobile: ''
      },
      // 用户添加表单验证规则
      CreateClassFormRules: {
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
      // 修改班级
      editDialogVisible: false,
      ModifyClassForm: {},
      // 编辑用户表单验证
      ModifyClassFormRules: {
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
    this.getClassList()
  },
  methods: {
    async getClassList () {
      const { data: res } = await this.$http.get('getClassList', { params: this.queryInfo })
      // const { data: res } = await axios.get('http://10.102.101.75:1234/getClassList/', {
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
      this.ClassList = res.data.ClassList
      this.total = res.data.total
      // console.log(this.ClassList)
    },
    // 监听 pagesize改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getClassList()
    },
    // 监听 页码值 改变事件
    handleCurrentChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagenum = newSize
      this.getClassList()
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
    // 监听 创建班级对话框的关闭事件
    CreateDialogClosed () {
      this.$refs.CreateClassFormRef.resetFields()
    },
    // 创建班级
    CreateClass () {
      // 提交请求前，表单预验证
      this.$refs.CreateClassFormRef.validate(async valid => {
        // console.log(valid)
        // 表单预校验失败
        if (!valid) return
        const { data: res } = await this.$http.get('CreateClass', { params: this.CreateClassForm })
        // const { data: res } = await axios.get('http://localhost:1234/CreateClass/', {
        //   params: this.CreateClassForm
        // })
        if (res.meta.status === 200) {
          this.$message.success('创建班级成功！')
        } else {
          this.$message.error('创建班级失败！')
        }
        // 隐藏创建班级对话框
        this.CreateDialogVisible = false
        this.getClassList()
      })
    },
    // 编辑用户信息
    async showEditDialog (cid) {
      // const { data: res } = await this.$http.get('users/' + cid)
      // const { data: res } = await axios.get('http://localhost:1234/CreateClass/', {
      //   params: this.CreateClassForm
      // })
      // if (res.meta.status !== 200) {
      //   return this.$message.error('查询用户信息失败！')
      // }
      this.ModifyClassForm.cid = cid
      this.editDialogVisible = true
    },
    // 监听修改班级对话框的关闭事件
    editDialogClosed () {
      this.$refs.ModifyClassFormRef.resetFields()
    },
    // 修改班级信息
    ModifyClass () {
      // 提交请求前，表单预验证
      this.$refs.ModifyClassFormRef.validate(async valid => {
        // console.log(valid)
        // 表单预校验失败
        if (!valid) return
        // const { data: res } = await this.$http.put(
        //   'ModifyClass/' + this.ModifyClassForm
        // )
        const { data: res } = await this.$http.get('ModifyClass', { params: this.ModifyClassForm })
        // const { data: res } = await axios.get('http://localhost:1234/ModifyClass/', {
        //   params: this.ModifyClassForm
        // })
        if (res.meta.status !== 200) {
          this.$message.error('修改班级信息失败！')
        } else {
          this.$message.success('修改班级信息成功！')
        }
        // 隐藏创建班级对话框
        this.editDialogVisible = false
        this.getClassList()
      })
    },
    // 删除班级
    async delClass (cid) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该班级, 是否继续?',
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
      const { data: res } = await this.$http.get('delClass', { params: { 'cid': cid } })
      // const { data: res } = await axios.get('http://localhost:1234/delClass/', {
      //   params: { 'cid': cid }
      // })
      if (res.meta.status !== 200) return this.$message.error('删除班级失败！')
      this.$message.success('删除班级成功！')
      this.getClassList()
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
      this.getClassList()
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
