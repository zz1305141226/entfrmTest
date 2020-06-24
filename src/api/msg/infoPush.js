import request from '@/utils/request'

// 查询消息推送列表
export function listInfoPush(query) {
  return request({
    url: '/msg/infoPush/list',
    method: 'get',
    params: query
  })
}

// 查询消息推送详细
export function getInfoPush(id) {
  return request({
    url: '/msg/infoPush/' + id,
    method: 'get'
  })
}

// 新增消息推送
export function addInfoPush(data) {
  return request({
    url: '/msg/infoPush/save',
    method: 'post',
    data: data
  })
}

// 修改消息推送
export function editInfoPush(data) {
  return request({
    url: '/msg/infoPush/update',
    method: 'put',
    data: data
  })
}

// 删除消息推送
export function delInfoPush(id) {
  return request({
    url: '/msg/infoPush/remove/' + id,
    method: 'delete'
  })
}


// 导出消息推送
export function exportInfoPush(query) {
  return request({
    url: '/msg/infoPush/export',
    method: 'get',
    params: query
  })
}
