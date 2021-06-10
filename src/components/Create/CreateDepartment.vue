<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系管理</el-breadcrumb-item>
      <el-breadcrumb-item>系列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索 添加 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getDepartmentList">
            <el-button slot="append" icon="el-icon-search" @click="getDepartmentList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="CreateDialogVisible = true">创建系</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="DepartmentList" border stripe>
        <!-- stripe: 斑马条纹
        border：边框-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="DepartmentID" label="系编号"></el-table-column>
        <el-table-column prop="DepartmentName" label="系名称"></el-table-column>
        <el-table-column prop="DepartmentProfessor" label="系负责人"></el-table-column>
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
              @click="showEditDialog(scope.row.DepartmentID)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              @click="delDepartment(scope.row.DepartmentID)"
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

    <!-- 创建系的对话框 -->
    <el-dialog title="创建系" :visible.sync="CreateDialogVisible" width="50%" @close="CreateDialogClosed">
      <!-- 内容主体 -->
      <el-form
        :model="CreateDepartmentForm"
        ref="CreateDepartmentFormRef"
        label-width="100px"
      >
      <!-- <el-form
        :model="CreateDepartmentForm"
        ref="CreateDepartmentFormRef"
        :rules="CreateDepartmentFormRules"
        label-width="100px"
      > -->
        <el-form-item label="系编号" prop="DepartmentID">
          <el-input v-model="CreateDepartmentForm.DepartmentID"></el-input>
        </el-form-item>
        <el-form-item label="系名" prop="DepartmentName">
          <el-input v-model="CreateDepartmentForm.DepartmentName"></el-input>
        </el-form-item>
        <el-form-item label="系负责人" prop="DepartmentProfessor">
          <el-input v-model="CreateDepartmentForm.DepartmentProfessor"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="CreateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="CreateDepartment">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改系的对话框 -->
    <el-dialog
      title="修改系信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体 -->
      <el-form
        :model="ModifyDepartmentForm"
        ref="ModifyDepartmentFormRef"
        label-width="100px"
      >
      <!-- <el-form
        :model="ModifyDepartmentForm"
        ref="ModifyDepartmentFormRef"
        :rules="ModifyDepartmentFormRules"
        label-width="100px"
      > -->
        <el-form-item label="系编号" pro="DepartmentID">
          <el-input v-model="ModifyDepartmentForm.DepartmentID" disabled></el-input>
        </el-form-item>
        <el-form-item label="系名" prop="DepartmentName">
          <el-input v-model="ModifyDepartmentForm.DepartmentName"></el-input>
        </el-form-item>
        <el-form-item label="系负责人" prop="DepartmentProfessor">
          <el-input v-model="ModifyDepartmentForm.DepartmentProfessor"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="ModifyDepartment">确 定</el-button>
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
import axios from 'axios'
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
      DepartmentList: [],
      total: 0,
      // 创建系对话框
      CreateDialogVisible: false,
      // 用户添加
      CreateDepartmentForm: {
        DepartmentID: '',
        DepartmentName: '',
        DepartmentProfessor: ''
        // mobile: ''
      },
      // 用户添加表单验证规则
      CreateDepartmentFormRules: {
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
      // 修改系
      editDialogVisible: false,
      ModifyDepartmentForm: {},
      // 编辑用户表单验证
      ModifyDepartmentFormRules: {
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
    this.getDepartmentList()
  },
  methods: {
    async getDepartmentList () {
      const { data: res } = await axios.get('http://localhost:1234/getDepartmentList/', {
        params: this.queryInfo
      })
      // axios.get('http://127.0.0.1:1234/us')
      // const { data: res } = await this.$http.get('users', {
      //   params: this.queryInfo
      // })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      console.log(res)
      this.DepartmentList = res.data.Departmentlist
      this.total = res.data.total
      // console.log(this.DepartmentList)
    },
    // 监听 pagesize改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getDepartmentList()
    },
    // 监听 页码值 改变事件
    handleCurrentChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagenum = newSize
      this.getDepartmentList()
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
    // 监听 创建系对话框的关闭事件
    CreateDialogClosed () {
      this.$refs.CreateDepartmentFormRef.resetFields()
    },
    // 创建系
    CreateDepartment () {
      // 提交请求前，表单预验证
      this.$refs.CreateDepartmentFormRef.validate(async valid => {
        // console.log(valid)
        // 表单预校验失败
        if (!valid) return
        // const { data: res } = await this.$http.post('CreateDepartment', this.CreateDepartmentForm)
        const { data: res } = await axios.get('http://localhost:1234/CreateDepartment/', {
          params: this.CreateDepartmentForm
        })
        if (res.meta.status === 200) {
          this.$message.success('创建系成功！')
        } else {
          this.$message.error('创建系失败！')
        }
        // 隐藏创建系对话框
        this.CreateDialogVisible = false
        this.getDepartmentList()
      })
    },
    // 编辑用户信息
    async showEditDialog (DepartmentID) {
      // const { data: res } = await this.$http.get('users/' + DepartmentID)
      // const { data: res } = await axios.get('http://localhost:1234/CreateDepartment/', {
      //   params: this.CreateDepartmentForm
      // })
      // if (res.meta.status !== 200) {
      //   return this.$message.error('查询用户信息失败！')
      // }
      this.ModifyDepartmentForm.DepartmentID = DepartmentID
      this.editDialogVisible = true
    },
    // 监听修改系对话框的关闭事件
    editDialogClosed () {
      this.$refs.ModifyDepartmentFormRef.resetFields()
    },
    // 修改系信息
    ModifyDepartment () {
      // 提交请求前，表单预验证
      this.$refs.ModifyDepartmentFormRef.validate(async valid => {
        // console.log(valid)
        // 表单预校验失败
        if (!valid) return
        // const { data: res } = await this.$http.put(
        //   'ModifyDepartment/' + this.ModifyDepartmentForm
        // )
        const { data: res } = await axios.get('http://localhost:1234/ModifyDepartment/', {
          params: this.ModifyDepartmentForm
        })
        if (res.meta.status !== 200) {
          this.$message.error('修改系信息失败！')
        } else {
          this.$message.success('修改系信息成功！')
        }
        // 隐藏创建系对话框
        this.editDialogVisible = false
        this.getDepartmentList()
      })
    },
    // 删除系
    async delDepartment (DepartmentID) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该系, 是否继续?',
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
      // const { data: res } = await this.$http.delete('delDepartment/' + DepartmentID)
      const { data: res } = await axios.get('http://localhost:1234/delDepartment/', {
        params: { 'DepartmentID': DepartmentID }
      })
      if (res.meta.status !== 200) return this.$message.error('删除系失败！')
      this.$message.success('删除系成功！')
      this.getDepartmentList()
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
      this.getDepartmentList()
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
