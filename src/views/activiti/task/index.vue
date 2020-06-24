<template>
  <div class="app-container">
    <el-form :task="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="任务名称" prop="taskName">
        <el-input
          v-model="queryParams.taskName"
          placeholder="请输入任务名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh-right" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">

      <div class="top-right-btn">
        <el-tooltip class="item" effect="dark" content="刷新" placement="top">
          <el-button size="mini" circle icon="el-icon-refresh" @click="handleQuery"/>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" :content="showSearch ? '隐藏搜索' : '显示搜索'" placement="top">
          <el-button size="mini" circle icon="el-icon-search" @click="showSearch=!showSearch"/>
        </el-tooltip>
      </div>
    </el-row>

    <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="任务id" align="center" prop="taskId"/>
      <el-table-column label="任务名称" align="center" prop="taskName" :show-overflow-tooltip="true"/>
      <el-table-column label="节点key" align="center" prop="nodeKey" :show-overflow-tooltip="true"/>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.status == '1' ? 'danger' : ''"
            effect="dark">
            {{scope.row.status == '1' ? '待办' : '已办'}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-success"
            @click="handleCheck(scope.row)"
            v-hasPerm="['task_check']"
          >审批
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-tickets"
            @click="handleComment(scope.row, 'active')"
            v-hasPerm="['task_comment']"
          >审批意见
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-picture"
            @click="handleTrack(scope.row)"
            v-hasPerm="['task_track']"
          >流程追踪
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.current"
      :limit.sync="queryParams.size"
      @pagination="getList"
    />

    <!-- 任务审批对话框 -->
    <el-dialog title="任务审批" :visible.sync="showCheckDialog" width="760px">
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务编号：">{{ form.taskId }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务名称：">{{ form.taskName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请假类型：">{{ selectDictLabel(typeOptions, form.type) }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请假人：">{{ form.userName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请假时间：">{{ form.leaveTime }} （{{ form.days }}天）</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提交时间：">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请假事由：">{{ form.cause }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="审批意见：">
              <el-input v-model="form.comment" type="textarea" rows="3" placeholder="请输入审批意见"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-for="flag in flagList"
          :key="flag"
          type="primary"
          icon="el-icon-check"
          plain
          @click="handleTask(flag)">{{ flag }}
        </el-button>
        <el-button @click="showCheckDialog = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 审批意见对话框 -->
    <el-dialog title="审批意见" :visible.sync="showCommentDialog" width="760px">
      <el-table v-loading="loading" :data="commentList">
        <el-table-column label="任务id" align="center" prop="id"/>
        <el-table-column label="审批人" align="center" prop="userId" :show-overflow-tooltip="true"/>
        <el-table-column label="审批意见" align="center" prop="fullMessage" :show-overflow-tooltip="true"/>
        <el-table-column label="审批时间" align="center" prop="time" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.time) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 任务跟踪对话框 -->
    <el-dialog title="任务图" :visible.sync="showImgDialog" width="760px">
      <img :src="imgUrl" style="padding-bottom: 60px;">
    </el-dialog>

  </div>
</template>

<script>
  import {listTask, getTask, checkTask, taskComment} from "@/api/activiti/task";

  export default {
    name: "Task",
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 任务表格数据
        taskList: [],
        // 审批意见数据
        commentList: [],
        // 弹出层标题
        title: "",
        // 是否显示审批弹出层
        showCheckDialog: false,
        // 是否显示批注弹出层
        showCommentDialog: false,
        // 是否显示任务图
        showImgDialog: false,
        flagList: {},
        //任务图url
        imgUrl: '',
        // 请假类型数据字典
        typeOptions: [],
        // 查询任务
        queryParams: {
          current: 1,
          size: 10,
          name: undefined,
          category: undefined,
          key: undefined
        },
        // 显示搜索条件
        showSearch: true,
        // 表单任务
        form: {},
        // 表单校验
        rules: {}
      };
    },
    created() {
      this.getList();
      this.getDicts("leave_type").then(response => {
        this.typeOptions = response.data;
      });
    },
    methods: {
      /** 查询任务列表 */
      getList() {
        this.loading = true;
        listTask(this.queryParams).then(response => {
          console.log(response.data)
            this.taskList = response.data;
            this.total = response.total;
            this.loading = false;
          }
        );
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.current = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.id)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      reset() {
        this.form = {}
        this.flagList = {}
      },
      /** 流程审批按钮操作 */
      handleCheck(row) {
        this.reset();
        getTask(row.taskId).then(response => {
          this.form = response.data;
          this.flagList = this.form.flagList
          this.showCheckDialog = true
        });
      },
      /** 流程批注按钮操作 */
      handleComment(row) {
        taskComment(row.taskId).then(response => {
          console.log(JSON.stringify(response.data))
          this.commentList = response.data;
          this.showCommentDialog = true
        });
      },
      handleTask: function (result) {
        this.form.taskFlag = result
        checkTask(this.form).then(response => {
          if (response.code === 0) {
            this.msgSuccess("操作成功");
            this.showCheckDialog = false;
            this.getList();
          } else {
            this.msgError(response.msg);
          }
        });
      },
      /** 流程追踪按钮操作 */
      handleTrack(row) {
        this.imgUrl = process.env.VUE_APP_BASE_API + `/activiti/task/track/` + row.taskId,
        this.showImgDialog = true
      }
    }
  };
</script>
